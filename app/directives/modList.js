angular.module('FarmingSimApp').directive('modList', modList).controller('modListController', modListController);

function modList(){
    return {
        templateUrl: 'directives/modList.html',
        controller: 'modListController as modListCtl'
    }
}

modListController.$inject = ['modhubCrawlerService', '$location', '$http'];

function modListController(modhubCrawlerService, $location, $http) {

    var vm = this;

    var iframe = angular.element('<iframe src="https://farming-simulator.com/img/page/logo-main_en.png" style="display:none"></iframe>').appendTo('body');

    vm.mods = [];
    vm.loading = true;

    vm.pageSize = $location.search().pageSize || 20;

    vm.imageLoader = function(url){
        if($location.search().noImages) return null;
        return 'https://referer-host-proxy.herokuapp.com/?url=' + encodeURIComponent(url);
    }

    getPage(0);

    function getPage(page) {
        
        modhubCrawlerService.getPage(page).then(function(data){
            vm.mods = vm.mods.concat(data.mods);
            
            if(data.nextPageId !== undefined){
                getPage(data.nextPageId);
            }
            else {
                vm.loading = false;
            }
        });
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
