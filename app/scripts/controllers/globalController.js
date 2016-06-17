/**
 * Created by nferon on 17/06/16.
 */
'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:GlobalCtrl
 * @description
 * # GlobalCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('GlobalCtrl', function ($scope, $resource) {

        $scope.apiUrl = "http://localhost:5000/";
        $scope.globalGraphSigma = [];
        $scope.layoutChoice = "FM^3 (OGDF)";
        $scope.globalel = false;

        // get layout algo
        var Layout = $resource($scope.apiUrl + 'layoutAlgorithm');
        var layout = Layout.query();
        layout.$promise.then(function (result) {
            var layout = []
            var layoutName = ""
            angular.forEach(result, function(value, key) {
                layoutName = ""
                angular.forEach(value, function(value2, key) {
                    layoutName += value2;
                });
                layout.push(layoutName)
            });
            $scope.layout = layout;
        });


        $scope.submit = function () {
            // // Read the complete graph from api
            var drawGraph = $resource($scope.apiUrl + 'draw/complete/' + $scope.layoutChoice);
            var drawgraph = drawGraph.query();
            drawgraph.$promise.then(function (result) {
                $scope.globalGraphSigma = result.pop();
                console.log("done");
            });
        };
        $scope.submit();

        /*** Radar Chart ***/
        $scope.post = {};
        // get posts type
        var Type = $resource($scope.apiUrl + 'post/getType/');
        var type = Type.query();
        type.$promise.then(function (result) {

            $scope.post.labels = result[0].labels;
            $scope.post.data = result[0].data;

        });


    });