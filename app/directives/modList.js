angular.module('FarmingSimApp').directive('modList', modList).controller('modListController', modListController);

function modList(){
    return {
        templateUrl: 'directives/modList.html',
        controller: 'modListController as modListCtl'
    }
}

modListController.$inject = ['modhubCrawlerService', '$location', '$http', '$q'];

function modListController(modhubCrawlerService, $location, $http, $q) {

    var vm = this;

    var iframe = angular.element('<iframe src="https://farming-simulator.com/img/page/logo-main_en.png" style="display:none"></iframe>').appendTo('body');

    vm.mods = [];
    vm.loading = true;

    vm.pageSize = $location.search().pageSize || 20;

    vm.imageLoader = function(url){
        if($location.search().noImages) return null;
        return 'https://referer-host-proxy.herokuapp.com/?url=' + encodeURIComponent(url);
    }

    modhubCrawlerService.getCategories().then(function(categories){
        vm.categories = categories;

        var promises = [];
        for(var i = 0; i < vm.categories.length; i++){
            promises.push(getPage(0, vm.categories[i], []).then(function(mods){

                var notDupes = [].concat(mods);
                for(var i = 0; i < vm.mods.length; i++){
                    for(var j = 0; j < notDupes.length; j++){
                        if(vm.mods[i].id === notDupes[j].id){
                            var combinedMod = vm.mods[i];

                            for(var k = 0; k < notDupes[j].categories.length; k++){
                                combinedMod.categories[notDupes[j].categories[k]] = notDupes[j].categories[notDupes[j].categories[k]] // This mess grabs the key and assigns it the value of that key 
                                combinedMod.categories[combinedMod.categories.length++] = notDupes[j].categories[k] // This mess grabs the key and assigns it to the biggest index and increments the length
                            }

                            vm.mods[i] = combinedMod;
                            notDupes.splice(j, 1);
                            j--; // Go back one to make the index match again
                        }
                    }
                }

                vm.mods = vm.mods.concat(notDupes);
                return mods;
            }));
        }

        $q.all(promises).then(function(results){
            vm.loading = false;
        });
    });

    function getPage(page, category, mods) {
        
        return modhubCrawlerService.getPage(page, category).then(function(data){
            mods = mods.concat(data.mods)
            if(data.nextPageId !== undefined){
                return getPage(data.nextPageId, data.category[0], mods);
            }
            else {
                return $q.when(mods);
            }
        });
    }

    vm.renderCategories = function(categories) {
        var cats = [];
        for(var i = 0; i < categories.length; i++){
            cats.push(categories[categories[i]]);
        }
        return cats.join(', ');
    }

    vm.downloadMod = function(mod){

        iframe.attr('src', 'https://cdn16.giants-software.com/modHub/storage/' + ("0000000"+mod.id).slice(-8) + '/FS17_' + mod.title.split(' ').join('_') + '.zip');

        /*
        $http({
            method: 'GET',
            url: 'https://referer-host-proxy.herokuapp.com/?url=' + encodeURIComponent('https://cdn16.giants-software.com/modHub/storage/' + ("0000000"+mod.id).slice(-8) + '/FS17_' + mod.title.split(' ').join('_') + '.zip'),
            responseType: 'arraybuffer'
        }).then(function(response){
            var blob = new Blob([response.data], { type:"application/octet-stream" });			
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href',(window.URL || window.webkitURL).createObjectURL(blob));
            downloadLink.attr('download', 'FS17_' + mod.title.split(' ').join('_') + '.zip');
            downloadLink[0].click();
        });
        */

    }
}
