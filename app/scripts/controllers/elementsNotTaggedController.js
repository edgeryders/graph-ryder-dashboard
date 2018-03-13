/**
 * Created by nferon on 21/06/16.
 */
angular.module('sbAdminApp')
    .controller('ElementsNotTaggedCtrl', function ($scope, $resource, config, $uibModal, $rootScope, $q, $location, $timeout, $compile, NgTableParams) {
        $scope.infoPanelParent = "infoPanelParent";

        var resource = $resource(config.apiUrl + "content/nottagged").get();
        resource.$promise.then(function (result) {
            $scope.content = result;

            $scope.postsTable = new NgTableParams({
              count: 25 // initial page size
            }, {
              dataset: result.posts
            });

            $scope.commentsTable = new NgTableParams({
              count: 25 // initial page size              
            }, {
              dataset: result.comments
            });

        });

 
        /********* Info Panel ***************/
        $scope.openInfoPanel = function(elementType, elementId) {
            var mod = document.createElement("panel-info");
            mod.setAttribute("type", elementType);
            mod.setAttribute("id", elementId);
            mod.setAttribute("parent", $scope.infoPanelParent);
            jQuery("#"+ $scope.infoPanelParent).append(mod);
            $compile(mod)($scope);
        };

        $scope.$on("$destroy", function(){
            //todo stop all active request
            // remove watchers in rootScope
            angular.forEach($rootScope.$$watchers, function(watcher, key) {
                if(watcher.exp === 'search' || watcher.exp === 'ready') {
                    $rootScope.$$watchers.splice(key, 1);
                }
            });
        });
});
