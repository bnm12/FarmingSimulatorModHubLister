angular.module('FarmingSimApp').factory('modhubCrawlerService', modhubCrawlerService);

modhubCrawlerService.$inject = ['$http', '$q', '$sce'];

var proxyNr = getRandomInt(3);
var allCategories;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function modhubCrawlerService($http, $q, $sce){

    var baseUrl = 'https://farming-simulator.com';

    var cache = {};

    var service = {
        
        getPage: getPage,

        getCategories: getCategories,

        getMod: getMod

    }

    return service;

    function getMod(modId) {
        return $http({
            method: 'GET',
            url: generateCORSUrl(baseUrl + '/mod.php?mod_id=' + modId),
            transformResponse : function(data) {
                // string -> XML document object
                return $.parseHTML(data);
            }
        }).then(function (response){
            return parseModPage(response.data);
        }, function(response){ // Fail
            if(response.status == 503 || response.status == 522 || response.status == 523){
                return getMod(modId);
            }
        }).catch(function(error){ //Error
            return getMod(modId);
        });
    }

    function getCategories() {
        return $http({
            method: 'GET',
            url: generateCORSUrl(baseUrl + '/mods.php?filter=latest&page=10000000'),
            transformResponse : function(data) {
                // string -> XML document object
                return $.parseHTML(data);
            }
        }).then(function (response){
            return allCategories = parseCategoriesPage(response.data);
        }, function(response){ // Fail
            if(response.status == 503 || response.status == 522 || response.status == 523){
                return getCategories();
            }
        }).catch(function(error){ //Error
            return getCategories();
        });
    }

    function getPage(pageNr, category) {
        category = category || 'latest';
        return $http({
        
            method: 'GET', 
            url: generateCORSUrl(baseUrl + '/mods.php?filter=' + category + '&page=' + pageNr),
            transformResponse : function(data) {
                // string -> XML document object
                return $.parseHTML(data);
            }
        
        }).then(function(response){ // Success
            return parseModListPage(response.data, category);
        }, function(response){ // Fail
            if(response.status == 503 || response.status == 522 || response.status == 523){
                return getPage(pageNr);
            }
        }).catch(function(error){ //Error
            return getPage(pageNr);
        });
    }

    function parseModPage(page){
        var dataObj = $(page);
        
        var downloadElement = dataObj.find('.download-box a');

        var modObj = {
            downloadUrl: downloadElement.attr('href')
        }

        return modObj;
    }

    function parseCategoriesPage(page) {
        var dataObj = $(page);

        var categories = {};

        dataObj.find('.tabs > .tabs-title:contains("CATEGORY") > ul > li > a').each(function(index){
            var ele = this;

            categories[categories[index] = ele.search.match(/filter=(.*)&/i)[1]] = ele.innerText;
            categories.length = index + 1;
        });
        return categories;
    }

    function parseModListPage(page, category){
        var dataObj = $(page);
    
        var nextElement = dataObj.find('.pagination-next > a');
        var prevElement = dataObj.find('.pagination-previous > a');
        var maxElement = dataObj.find('.pagination > li:last-child')
    
        var modObjs = [];
        
        dataObj.find('.mod-item__img a[href^="mod.php"]').closest('.mod-item').each(function(index){
    
            modObjs.push(parseModItem(this, category));
    
        });
        
        var catObj = {};
        catObj[category] = allCategories[category]
        catObj[0] = category;
        catObj.length = 1;

        var rtnObj = {
            mods: modObjs,
            category: catObj,
            nextPageId: nextElement.length ? nextElement.get(0).search.match(/(\d*?)$/i)[1] * 1 : undefined,
            prevPageId: prevElement.length ? prevElement.get(0).search.match(/(\d*?)$/i)[1] * 1 : undefined,
            maxPage: maxElement.length ? maxElement.text() - 1 : undefined
        };
    
        return rtnObj;
    }
    
    function parseModItem(item, category){
        var ele = $(item);
        
        var itemContent = ele.find('.mod-item__content');
        var ratingString = itemContent.find('.mod-item__rating-num').text() || "0 (0)";
        
        var catObj = {};
        catObj[category] = allCategories[category]
        catObj[0] = category;
        catObj.length = 1;

        var modObj = {
            id: ele.find('.mod-item__img > a').get(0).search.match(/mod_id=(\d*?)&/i)[1] * 1,
            imageUrl: ele.find('.mod-item__img > a > img').get(0).src,
            title: itemContent.children('h4').text(),
            creator: itemContent.find('p > span').text().match(/By: (.*?$)/i)[1],
            rating: ratingString.match(/(^[\d.]*)/i)[1],
            votes: parseInt(ratingString.match(/\(([\d]*?)\)$/im)[1], 10),
            label: ele.find('.mod-label').text().replace('!', ''),
            categories: catObj
        };
    
        $sce.trustAsResourceUrl('https://referer-host-proxy.herokuapp.com/?url=' + encodeURIComponent(modObj.imageUrl));
    
        return modObj;
    }
}

function generateCORSUrl(url) {
    /*
    if (proxyNr === 0){
        proxyNr = 1;
        return 'https://galvanize-cors-proxy.herokuapp.com/' + encodeURI(url);
    }
    else if (proxyNr === 1){
        proxyNr = 0;
        return 'https://referer-host-proxy.herokuapp.com/?url=' + encodeURIComponent(url);
    }
    */

    proxyNr = getRandomInt(3);

    switch (proxyNr){
        case 0:
            return 'https://crossorigin.me/' + encodeURI(url);
        
        case 1:
            return 'https://cors-anywhere.herokuapp.com/' + encodeURI(url);
            
        case 2:
            return 'https://referer-host-proxy.herokuapp.com/?url=' + encodeURIComponent(url);
    }
/**/
}