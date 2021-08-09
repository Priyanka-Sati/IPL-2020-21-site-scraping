let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");


let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
request(url, cb);
function cb(error, response, html){
    if(error){
        console.log(error);
    }
    else if(response.statusCode == 404){
        console.log("Page not Found");
    }
    else{
        allMatchPage(html);
    }
}

function allMatchPage(html){
    // getting all html from given url
    let searchTool = cheerio.load(html);
    
    // geting perticular class element
    let button = searchTool(".widget-items.cta-link");
    let anchortag = searchTool(button).find("a");
    //getting link from anchortag
    let link = anchortag.attr("href");

    link = `https://www.espncricinfo.com${link}`;
    request(link,cb2 )
    //console.log(link, cb2);
}



function cb2(error, response, html){
    if(error){
        console.log(error);
    }
    else if(response.statusCode == 404){
        console.log("Page not Found");
    }
    else{
        MatchTable(html);
    }
}

function MatchTable(html){
    let searchTool = cheerio.load(html);

    let allcards = searchTool("a[data-hover='Scorecard']");
    for(let i = 0; i < allcards.length; i++){
        let link = searchTool(allcards[i]).attr("href");
        link = `https://www.espncricinfo.com${link}`;
       
        request(link,cb3);
        
        
    } 
}

function cb3(error, response, html){
    if(error){
        console.log(error);
    }
    else if(response.statusCode == 404){
        console.log("Page not Found");
    }
    else{
        stats(html);
    }
}

function stats(html){

    // get content of site
    let searchTool = cheerio.load(html);

    let bothInningArr = searchTool(".Collapsible");

    let matchinfo = searchTool(".match-info .description").text();
    let venue =  matchinfo.split(',')[1].trim();
    let date = matchinfo.split(',')[2].trim();

    //current path
    let currPath = process.cwd();


    for( let i = 0 ; i < bothInningArr.length ; i++ ){
        
        //Getting team name and modifying it.
        //team name is in the h5 tag inside table.
        let teamName = searchTool(bothInningArr[i]).find("h5");
        teamName = teamName.text();
        teamName = teamName.split("INNINGS")[0];
        teamName = teamName.trim();

        let opponentTeam = searchTool(bothInningArr[i == 0 ? 1 : 0]).find("h5");
        opponentTeam = opponentTeam.text();
        opponentTeam = opponentTeam.split("INNINGS")[0];
        opponentTeam = opponentTeam.trim();


        // getting all rows of batsman table
        let batsmanTableAllRows = searchTool( bothInningArr[i]).find(".table.batsman tbody tr");
        for( let j = 0 ; j < batsmanTableAllRows.length ; j++ ){
            let numbersofTDs = searchTool( batsmanTableAllRows[j]).find("td");
            if( numbersofTDs.length == 8 ){
                let playerName = searchTool( numbersofTDs[0]).text();
                let run = searchTool( numbersofTDs[2]).text();
                let balls = searchTool( numbersofTDs[3]).text();
                let fours = searchTool( numbersofTDs[5]).text();
                let six = searchTool( numbersofTDs[6]).text();
                let sr = searchTool( numbersofTDs[7]).text();


                if( !fs.existsSync( path.join( currPath , teamName ) ) ){
                    fs.mkdirSync( path.join( currPath , teamName ) );
                    let filepath = path.join( currPath , teamName , playerName ); 
                    let heading = "My Team Name\t Name\t Venue\t Date\t Opponent Team Name\t Runs\t Balls\t Fours\t Sixex\t SR\t"; 
                    let firstLine = "\n" + teamName + "\t" + playerName + "\t" + venue  + "\t" + date + "\t" + opponentTeam + "\t" + run + "\t" + balls + "\t" + fours + "\t" + six + "\t" + sr;
                    fs.writeFileSync( filepath , heading );
                    fs.appendFileSync( filepath , firstLine );

                }else{
                    if( !fs.existsSync( path.join( currPath , teamName , playerName ) ) ){
                        let filepath = path.join( currPath , teamName , playerName ); 
                        let heading = "My Team Name\t Name\t Venue\t Date\t Opponent Team Name\t Runs\t Balls\t Fours\t Sixex\t SR\t"; 
                        let firstLine = "\n" + teamName + "\t" + playerName + "\t" + venue  + "\t" + date + "\t" + opponentTeam + "\t" + run + "\t" + balls + "\t" + fours + "\t" + six + "\t" + sr;
                        fs.writeFileSync( filepath , heading );
                        fs.appendFileSync( filepath , firstLine );
                    }else{
                        let filepath = path.join( currPath , teamName , playerName );
                        let lines = "\n" + teamName + "\t" + playerName + "\t" + venue  + "\t" + date + "\t" + opponentTeam + "\t" + run + "\t" + balls + "\t" + fours + "\t" + six + "\t" + sr;
                        fs.appendFileSync( filepath , lines );
                        console.log( lines );
                    }
                }
            }
            
        }
    }
}