//  ___             __   __   __        __   ___  __  
//  |__  |    | \_/ /__` /  ` |__)  /\  |__) |__  |__) 
//  |    |___ | / \ .__/ \__, |  \ /~~\ |    |___ |  \ 
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//         A MicroService By Sondre Bye Humberset                       
//Scrapes all movies and tv shows (names) from netflix.com/?so=az,yr,za
const express = require("express");
const app = express();
const puppeteer = require('puppeteer');
const request = require('request');
const fs = require('fs');

const urlM = 'https://www.netflix.com/browse/genre/34399?so=az';
const urlMY = 'https://www.netflix.com/browse/genre/34399?so=yr';
const urlMYZ = 'https://www.netflix.com/browse/genre/34399?so=za';

const urlS = 'https://www.netflix.com/browse/genre/83?so=az';
let cookies = JSON.parse(fs.readFileSync('files/netflixCookie.json', 'utf8'));

let remmedMovies = [];
let remmedShows = [];

async function scrape() {
    console.log("-");
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'],}); 
    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 926 });
    await page.setCookie(...cookies);


    async function scrollDown(){
        let wY = await page.evaluate('window.scrollY');
        let reachedBottom = false;
        let lastWY = 0;
        while(!reachedBottom)
        {
            wY = await page.evaluate('window.scrollY');
            lastWY = wY;
            await page.evaluate('window.scrollTo(0, window.scrollY+300)');
            await page.waitFor(500);
            wY = await page.evaluate('window.scrollY');
            if(wY === lastWY) {
                return "finito";
            }
        }  
    }
    
    async function scrapePage(name, url, arr, type) {
        await page.goto(url); console.log("Scraping "+type+" ("+name+")...");
        await scrollDown();
        arr.push(...await page.$$eval(".boxart-container", elm => {
                return elm.map(elm => elm.textContent.replace('"The Cove"', "'The Cove'")
            )}));
    }

    async function remDupes(id, arr1, arr2, type) {
        console.log("-");
        console.log("Parsing and removing dupes from ("+arr2.length+" "+type+")...");
        if(id===0){remmedMovies = [...new Set(arr2)];}
        if(id===1){remmedShows = [...new Set(arr2)];}
        console.log("All dupes has been removed, resulting in: ");
        if(id===0){console.log(remmedMovies.length + " unique "+type+" titles!")};
        if(id===1){console.log(remmedShows.length + " unique "+type+" titles!")};
    }

    let scrapedMovies = [];
    let scrapedShows = [];

    await scrapePage("A-Z", urlM, scrapedMovies, "movies");
    await scrapePage("Year->", urlMY, scrapedMovies, "movies");
    await scrapePage("Z-A", urlMYZ, scrapedMovies, "movies");
    await scrapePage("A-Z", urlS, scrapedShows, "shows");

    await remDupes(0, [], scrapedMovies, "movies");
    await remDupes(1, [], scrapedShows, "shows");

    await browser.close();
    console.log("Scraped all movies and shows!");
}

async function matchWithImdb() {

    let imdbMovies = [];
    let imdbShows = [];

    let rawImdbMovies = [];
    let rawImdbShows = [];
    
    async function compare(type, arr1, arr2, arr3, type2) {
        console.log("-");
        console.log("Comparing and retrieving "+type+" info from the OMDB-API...");
        for(const elm of arr1) {
            let x = new Promise((resolve, reject)=>{
                request("http://www.omdbapi.com/?t=" + elm + "&"+"type="+type2+"&apikey=thewdb", {timeout: 400}, (error, response, body)=>{
                    if(!error && response.statusCode == 200) {
                        if(JSON.parse(body).Response === "False") {
                            resolve(); 
                        } else {
                            arr2.push(JSON.parse(body));
                            resolve(); 
                        }
                    } else {
                        resolve();
                    }
                });
            });
            await x;
        }

        for(const elm of arr2) {
            if(arr1.includes(elm.Title))
            arr3.push(elm);
        }

        console.log("OMDB returned info for " + arr2.length + " "+type+", out of all " +arr1.length+" "+type+" we scraped!");
        console.log("Out of those, " + arr3.length + " matched with the " + arr1.length + " "+type+" we scraped!");
        fs.writeFile('files/imdb'+type+'.json', JSON.stringify(arr3), err=>{});
    }
    
    await compare("Movies", remmedMovies, rawImdbMovies, imdbMovies, "movie");
    await compare("Shows", remmedShows, rawImdbShows, imdbShows, "series").then(()=>{
        isBusy = false
        request.post({
            headers: {'content-type' : 'application/x-www-form-urlencoded'},
            url:     'http://localhost:80/updateFinished',
            body:    "msg=Update is finished! - from Scraper"
        }, function(err, res, body){
            if(!err && res.statusCode == 200){
                
            }
        });
    });
    console.log("Update finito!");
}

let isBusy = false;

async function runUpdate() {
    if(isBusy === false) {
        console.log("Starting update...");
        await scrape();
        await matchWithImdb();
    } else {
        console.log("Got an update request, but already updating!");
    }
}

app.get("/update", (req, res)=>{
    if(isBusy === true) {
        res.send("The scraper is busy... - from Scraper");
    } else {
        res.send("Recieved your update request, starting update now! - from Scraper");
    }
    runUpdate();
    isBusy = true;
});

app.listen("61914", console.log("Starting flixScraper on port 61914"));



