/**
 * Created by nferon on 01/07/16.
 */
'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */

angular.module('sbAdminApp')
  .directive('settings', function() {
    return {
      templateUrl:'scripts/directives/settings/settings.html',
      restrict: 'E',
      replace: true,
      scope: {
      },
      controller: function ($scope, $rootScope, $resource, config, $q, $compile) {

        $rootScope.resetSuggestions(false, false, false, false);

        /***** Load api infos *****/
        $scope.refresh = function () {

            $scope.api = {"url": config.apiUrl, "status": "unknown", "version": "unknown"};
            $scope.className = {"status": 'text-muted', "version": 'text-muted', "ram": 'bg-info', "disk": 'bg-info'};
            $scope.regen = {"complete": false, "users": false, "commentsAndPosts": false, "generated": false, "ramLoad": "unknown", "diskLoad": "unknown"};

            var Info = $resource(config.apiUrl + 'info');
            var info = Info.get();
            info.$promise.then(function (result) {
                // status
                $scope.api.status = result.status;
                if ($scope.api.status) // color
                    $scope.className.status = 'text-success';
 
                // version
                var d = new Date();
                d.setTime(result.version);
                $scope.api.version = d.toString();
                if (new Date().getTime() - d.getTime() > 2628000000) {
                    $scope.className.version = 'text-danger';
                }
                if (new Date().getTime() - d.getTime() < 604800000) {
                    $scope.className.version = 'text-success';
                }
                
                // ram usage
                $scope.api.ramLoad = result.percentRamUsage;
                if ($scope.api.ramLoad < 50.00) // color
                    $scope.className.ram = 'bg-success';
                else if ($scope.api.ramLoad < 80.00)
                    $scope.className.ram = 'bg-warning';
                else
                    $scope.className.ram = 'bg-danger';
                
                // Disk usage
                $scope.api.diskLoad = result.percentDiskUsage;
                if ($scope.api.diskLoad < 50.00) // color
                    $scope.className.disk = 'bg-success';
                else if ($scope.api.diskLoad < 80.00)
                    $scope.className.disk = 'bg-warning';
                else
                    $scope.className.disk = 'bg-danger';
            });
        };
        
        /***** refresh whan this is opened only *****/
        $scope.$on('aside-menu:show', function(evt, data){
          $scope.refresh();
        });

        /***** regenerate Graphs *****/
        $scope.regenerate = function () {
            $scope.regen.generated = "load";
            var collectPromises = [];
            // Create promises array to wait all data until load
            if($scope.regen.complete)
                collectPromises.push($resource(config.apiUrl + 'generateFullGraph').query().$promise);
            if($scope.regen.users)
                collectPromises.push($resource(config.apiUrl + 'generateUserGraph').query().$promise);
            if($scope.regen.commentsAndPosts)
                collectPromises.push($resource(config.apiUrl + 'generateCommentAndPostGraph').query().$promise);

            if($scope.regen.TagToTag)
                collectPromises.push($resource(config.apiUrl + 'generateTagFullGraph/1/0/' + new Date(Date.now()).getTime()+"/1").query().$promise);

            $q.all(collectPromises).then(function(results) {
                var value = true;
                angular.forEach(results, function(result) {
                    if(!result)
                        value = false;
                });
                if(value)
                    $scope.regen.generated = "done";
                else
                    $scope.regen.generated = "error";
            }, function (reject) {
                console.log(reject);
            });
        };

        $scope.UpdateFromEdgeryders = function () {
            var createGraph = $resource(config.apiUrl + 'UpdateFromEdgeRyders');
            var createGraphPromise = createGraph.get();
            createGraphPromise.$promise.then(function (result) {
            });
            console.log("hello");
        };

        /***** Upload and Update *****/
        $scope.upload = function () {
            $scope.regen = {"complete": true, "users": true, "commentsAndPosts": true, "generated": false};
            $scope.regenerate();
        };
      }    
    }
  });
