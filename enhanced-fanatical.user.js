// ==UserScript==
// @name         EnhancedFanatical
// @namespace    EnhancedFanatical
// @version      1.0.0
// @description  Userscript that highlights owned applications on Fanatical.com bundles
// @author       Raymond Law - https://github.com/raymondlaw
// @match        https://www.fanatical.com/*
// @grant        GM.xmlHttpRequest
// @run-at       document.idle
// ==/UserScript==
let user_apps = [];
(function() {
    'use strict';
    (function(history){
        var pushState = history.pushState;
        history.pushState = function(state) {
            if (typeof history.onpushstate == "function") {
                history.onpushstate({state: state});
            }
            // Perform on each AJAX page change
            setTimeout(function(){filter_games(user_apps);},1500);
            return pushState.apply(history, arguments);
        };
    })(window.history);
    setTimeout(main,2500);
})();

async function main(){
    user_apps = await get_steam_apps();
    filter_games(user_apps);
}

function filter_games(user_apps){
    let bundles = document.querySelectorAll('.bundle-accordion');
    let owned_games = [].filter.call(bundles , bundle => {
        let shop_link = bundle.querySelector('a[href*="store.steampowered.com/app/"]');
        if(shop_link == null) return false;
        let app_id = +(shop_link.href.substring(shop_link.href.indexOf('/app/')+5));
        return user_apps.indexOf(app_id) > -1;
    });
    owned_games.map(owned_game => {
        owned_game.getElementsByClassName('bundle-row')[0].style.setProperty('background', 'linear-gradient(to right,  rgba(163,207,6,0.6) 0%,rgba(75,106,33,0.6) 100%)', 'important');
    });
}

function get_steam_apps(){
    return new Promise(resolve => {
        GM.xmlHttpRequest({
            method: "GET",
            url: "http://store.steampowered.com/dynamicstore/userdata/",
            responseType: 'json',
            onload: function(response) {
                let steam_data = JSON.parse(response.responseText);
                resolve(steam_data.rgOwnedApps);
            }
        });
    });
}
