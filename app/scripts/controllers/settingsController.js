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
    .controller('SettingsCtrl', function ($scope, $resource, config, $q) {

        $scope.warning = {color: 'orange'};
        $scope.danger = {color: 'red'};
        $scope.success = {color: '#39b500'};

        /***** Load api infos *****/
        $scope.refresh = function () {
            
            $scope.api = {"url": config.apiUrl, "status": "unknown", "version": "unknown"};
            $scope.style = {"status": $scope.warning, "version": $scope.warning, "ram": $scope.warning, "disk": $scope.warning};
            $scope.regen = {"complete": false, "users": false, "commentsAndPosts": false, "generated": false, "ramLoad": "unknown", "diskLoad": "unknown"};

            var Info = $resource(config.apiUrl + 'info');
            var info = Info.get();
            info.$promise.then(function (result) {
                // status
                $scope.api.status = result.status;
                if ($scope.api.status) // color
                    $scope.style.status = $scope.success;
                // version
                $scope.api.version = result.version;
                if (new Date().getTime() - $scope.api.version > 2628000)
                    $scope.style.version = $scope.danger;
                if (new Date().getTime() - $scope.api.version < 604800)
                    $scope.style.version = $scope.success;
                // ram usage
                $scope.api.ramLoad = result.percentRamUsage;
                if ($scope.api.ramLoad < 50.00) // color
                    $scope.style.ram = $scope.success;
                else if ($scope.api.ramLoad < 80.00)
                    $scope.style.ram = $scope.warning;
                else
                    $scope.style.ram = $scope.danger;
                // Disk usage
                $scope.api.diskLoad = result.percentDiskUsage;
                if ($scope.api.diskLoad < 50.00) // color
                    $scope.style.disk = $scope.success;
                else if ($scope.api.diskLoad < 80.00)
                    $scope.style.disk = $scope.warning;
                else
                    $scope.style.disk = $scope.danger;
            });
        };

        $scope.refresh();

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

        /***** Upload and Update *****/
        $scope.upload = function () {
            $scope.regen = {"complete": true, "users": true, "commentsAndPosts": true, "generated": false};
            $scope.regenerate();
        };
});
