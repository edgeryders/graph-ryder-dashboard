/**
 * Created by adrien Dufraux on 12/06/17.
 */
'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:detanglerViewController
 * @description
 * # detanglerViewController
 * Controller of the sbAdminApp
 */

 angular.module('sbAdminApp')
     .controller('DetanglerViewCtrl', function ($scope, $resource, config, $uibModal, $rootScope, $q, $location, $timeout, $compile) {

         /**** Init ****/
         //edge label default
         $scope.tagel = false;
         $scope.tagnl = false;
         $scope.userel = false;
         $scope.usernl = false;
         $scope.nodeTagelThreshold = 10;
         $scope.nodeTagelThresholdMax = 10;
         $scope.nodeUserelThresholdMax = 10;
         $scope.nodeUserelThreshold = 10;
         $scope.locate = "";
         $scope.filter_occurence_tag_min = "2";
         $scope.filter_occurence_tag_max = "100";
         $scope.tag_id = 1879;
         $scope.tag_src = {id: $scope.tag_id, label:""};
         $scope.tag_dst = {id: -1, label:""};
         $scope.requestFullTagGraph = false;
         $scope.showTagCommonContent = false;
         $scope.tableSizeChoice = '10';
         $scope.interactor = "navigate";
         $scope.infoPanelParent = "infoPanelParent";
         $scope.selected = {}; //test
         $scope.selected.start= new Date(0);
         $scope.selected.end= new Date(Date.now());
         $scope.layoutChoice = 'Circular';
         $scope.defaultNodeColor = '';
         $scope.defaultNodeSize = '';


         // When rootScope is ready load the graph
         $rootScope.$watch('ready', function(newVal) {
             if(newVal) {
                 $scope.layoutChoice = $rootScope.layout[12];
                 $scope.userGraphRessource = $resource(config.apiUrl + 'draw/usersToUsers/' + $scope.layoutChoice);

                 $scope.drawUserGraph(true);
                 $scope.generateTagGraph();
             }
         });


         //Jquery handle user sliders
         $( "#node-label-user-intensity-slider" ).slider({
             min: 0,
             max: $scope.nodeUserelThresholdMax-1,
             value: $scope.nodeUserelThresholdMax-$scope.nodeUserelThreshold ,
             slide: function( event, ui ) {
                 $scope.nodeUserelThreshold = $scope.nodeUserelThresholdMax-ui.value;
                 $scope.$apply();
             }
         });

         //Jquery handle tag sliders
         $( "#node-label-tag-intensity-slider" ).slider({
             min: 0,
             max: $scope.nodeTagelThresholdMax-1,
             value: $scope.nodeTagelThresholdMax-$scope.nodeTagelThreshold ,
             slide: function( event, ui ) {
                 $scope.nodeTagelThreshold = $scope.nodeTagelThresholdMax-ui.value;
                 $scope.$apply();
             }
         });

         $( "#coocurrence-intensity-slider-range" ).slider({
             range: true,
             min: 1,
             max: $scope.filter_occurence_tag_max,
             values: [ $scope.filter_occurence_tag_min, $scope.filter_occurence_tag_max ],
             slide: function( event, ui ) {
                 $scope.filter_occurence_tag_min = ui.values[0];
                 $scope.filter_occurence_tag_max = ui.values[1];
                 $scope.$apply();
             }
         });



         /*** user view ***/
         $scope.usersGraphSigma = [];

         $scope.drawUserGraph = function (suggestions) {
             $scope.drawGraphPromise = $scope.userGraphRessource.get();
             $scope.drawGraphPromise.$promise.then(function (result) {
                 $scope.usersGraphSigma = result;
                 $scope.nodes = $scope.usersGraphSigma.nodes;
                 $scope.defaultNodeColor = $scope.usersGraphSigma.nodes[0].color
                 $scope.defaultNodeSize = $scope.usersGraphSigma.nodes[0].size
                 if(suggestions) {
                     $rootScope.suggestions = [];
                     angular.forEach($scope.nodes, function (node) {
                         if (node.name != undefined) {
                             node.label = node.name;
                             $rootScope.suggestions.push(node);
                         }
                     });
                 }
             });
         };

         $scope.tagsGraphSigma = [];

         $scope.drawTagGraph = function (result) {
             var drawGraph = $resource(config.apiUrl + 'draw/tagToTags/'+ $scope.layoutChoice);
             var drawgraph = drawGraph.get();
             drawgraph.$promise.then(function (result) {
                 $scope.tagsGraphSigma = result;
             });
         };

         $scope.generateTagGraph = function () {
             //$scope.filter_occ = filter_occ;
             var createGraph = $resource(config.apiUrl + 'generateTagFullGraph/' + $scope.filter_occurence_tag_min + "/" + $scope.selected.start.getTime() + "/" + $scope.selected.end.getTime()+"/0");
             //var createGraph = $resource(config.apiUrl + 'generateTagGraph/' + $scope.tag_id);
             var createGraphPromise = createGraph.get();
             createGraphPromise.$promise.then(function (result) {
                 $scope.drawTagGraph();
                 //console.log($scope.sigma_instance.graph.nodes())
             });
         };

         /******** Interactor Manager ********/
         $scope.clearInteractor = function() {
             document.getElementById("interactorNavigate").className="btn btn-default";
             document.getElementById("interactorSelectNode").className="btn btn-default";
             document.getElementById("interactorDragNode").className="btn btn-default";
             document.getElementById("interactorLasso").className="btn btn-default";
             document.getElementById("interactorDescriptionLabel").innerHTML = "";
         }

         $scope.setInteractorNavigate = function () {
             $scope.clearInteractor();
             $scope.interactor="navigate";
             document.getElementById("interactorNavigate").className="btn btn-primary";
             document.getElementById("interactorDescriptionLabel").innerHTML = $("#interactorNavigate").attr("data-title");
         }

         $scope.setInteractorNodeSelection = function () {
             $scope.clearInteractor();
             $scope.interactor="nodeSelection";
             document.getElementById("interactorSelectNode").className="btn btn-primary";
             document.getElementById("interactorDescriptionLabel").innerHTML = $("#interactorSelectNode").attr("data-title");
         }

         $scope.setInteractorDragNode = function () {
             $scope.clearInteractor();
             $scope.interactor="dragNode";
             document.getElementById("interactorDragNode").className="btn btn-primary";
             document.getElementById("interactorDescriptionLabel").innerHTML = $("#interactorDragNode").attr("data-title");
         }

         $scope.setInteractorLasso = function () {
             $scope.clearInteractor();
             $scope.interactor="lasso";
             document.getElementById("interactorLasso").className="btn btn-primary";
             document.getElementById("interactorDescriptionLabel").innerHTML = $("#interactorLasso").attr("data-title");
         }

         //document.getElementById("user-graph").$watch('threshold', function(newVal) {
        //     if(newVal) {
        //         console.log('threshold', newval);
        //     }
        // });

         /*** Sigma Event Catcher ***/
         $scope.eventCatcher = function (e) {};

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
