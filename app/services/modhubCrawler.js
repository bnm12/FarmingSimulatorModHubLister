angular.module('FarmingSimApp').factory('modhubCrawlerService', modhubCrawlerService);

modhubCrawlerService.$inject = ['$http', '$q'];

function modhubCrawlerService($http, $q){

    var baseUrl = 'https://farming-simulator.com';

    var cache = {};

    var service = {
        
        getPage: function(pageNr) {
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
                    };
                    modObjs.push(modObj);
                });

                var rtnObj = {
                    mods: modObjs,
                    nextPageId: nextElement.length ? nextElement.get(0).search.match(/(\d*?)$/i)[1] * 1 : undefined,
                    prevPageId: prevElement.length ? prevElement.get(0).search.match(/(\d*?)$/i)[1] * 1 : undefined
                };

                return rtnObj;
            });
        },

        getMod: function(modId) {

        }

    }

    return service;
}

function generateCORSUrl(url) {
    return 'https://cors-anywhere.herokuapp.com/' + encodeURI(url);
}