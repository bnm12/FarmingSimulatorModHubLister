angular.module('FarmingSimApp').factory('modhubCrawlerService', modhubCrawlerService);

modhubCrawlerService.$inject = ['$http', '$q'];

var selectedProxy;  

function modhubCrawlerService($http, $q){

    selectProxy();
    var baseUrl = 'https://farming-simulator.com';

    var cache = {};

    var service = {
        
        getPage: getPage,

        getMod: function(modId) {

        }

    }

    return service;

    function getPage(pageNr) {
        return $http({
        
            method: 'GET', 
            url: generateCORSUrl(baseUrl + '/mods.php?lang=en&country=us&title=fs2017&filter=latest&page=' + pageNr),
            transformResponse : function(data) {
                // string -> XML document object
                return $.parseHTML(data);
            }
        
        }).then(function(request){
            var dataObj = $(request.data);

            var nextElement = dataObj.find('.pagination-next > a');
            var prevElement = dataObj.find('.pagination-previous > a');

            var modObjs = [];
            
            dataObj.find('.mod-item__img a[href^="mod.php"]').parents('.mod-item').each(function(index){
                var ele = $(this);

                var itemContent = ele.find('.mod-item__content');
                var ratingString = itemContent.find('.mod-item__rating-num').text() || "0 (0)";

                var modObj = {
                    id: ele.find('.mod-item__img > a').get(0).search.match(/mod_id=(\d*?)&/i)[1] * 1,
                    imageUrl: ele.find('.mod-item__img > a > img').get(0).src,
                    title: itemContent.children('h4').text(),
                    creator: itemContent.find('p > span').text().match(/By: (.*?$)/i)[1],
                    rating: ratingString.match(/(^[\d.]*)/i)[1],
                    votes: ratingString.match(/\(([\d]*?)\)$/im)[1],
                    label: ele.find('.mod-label').text().replace('!', '')
                };
                modObjs.push(modObj);
            }, function(response){
                if(response.status == 503 || response.status == 522 || response.status == 523){
                    selectProxy();
                    return getPage(pageNr);
                }
            });

            var rtnObj = {
                mods: modObjs,
                nextPageId: nextElement.length ? nextElement.get(0).search.match(/(\d*?)$/i)[1] * 1 : undefined,
                prevPageId: prevElement.length ? prevElement.get(0).search.match(/(\d*?)$/i)[1] * 1 : undefined
            };

            return rtnObj;
        }).catch(function(error){
            selectProxy();
            return getPage(pageNr);
        });
    }

    function selectProxy(){
        selectedProxy = 3;// Math.floor(Math.random() * 3);
    
        var proxies = ['https://crossorigin.me/https://google.com', 'https://cors-anywhere.herokuapp.com/https://google.com', 'https://jsonp.afeld.me/?url=https%3A%2F%2Fgoogle.com', 'https://galvanize-cors-proxy.herokuapp.com/https://google.com']
    
        var promises = [];
        /*for(var i = 0; i < proxies.length; i++){
            promises.push($http.get(proxies[i]))
        }

        $q.race(promises).then(function(response){
            url = response.config.url;

            selectedProxy = proxies.indexOf(url);            
        })*/
    }

}

function generateCORSUrl(url) {
    switch (selectedProxy){
        case 0:
            return 'https://crossorigin.me/' + encodeURI(url);
        
        case 1:
            return 'https://cors-anywhere.herokuapp.com/' + encodeURI(url);
        
        case 2:
            return 'https://jsonp.afeld.me/?url=' + encodeURIComponent(url);

        case 3:
            return 'https://galvanize-cors-proxy.herokuapp.com/' + encodeURI(url);
    }
    
}