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
         $scope.userinteractor = "navigate";
         $scope.taginteractor = "navigate";
         $scope.selectTagNodesVennfct = $scope.fctUnion;
         $scope.selectUserNodesVennfct = $scope.fctUnion;
         $scope.infoPanelParent = "infoPanelParent";
         $scope.selected = {}; //test
         $scope.selected.start= new Date(0);
         $scope.selected.end= new Date(Date.now());
         $scope.layoutChoice = 'Circular';
         $scope.defaultUserNodeColor = '';
         $scope.defaultTagNodeColor = '';
         $scope.s_user = undefined;
         $scope.user_graph_intact = {};
         $scope.is_user_graph_intact = true;
         $scope.tag_graph_intact = {};
         $scope.is_tag_graph_intact = true;
         $scope.s_tag = undefined;
         $scope.lasso_user = {};
         $scope.lasso_tag = {};
         $scope.isCheckedUser = false;
         $scope.wichSelection = undefined;
         $scope.communityManagers = ["Alberto", "Nadia", "Noemi"];
         $scope.metricFilter = "occ";
         $scope.configAtlasForceAlgo = {scalingRatio:1,strongGravityMode:false,gravity:3,adjustSizes:true};
         $scope.configFruchtermanReingoldAlgo = {iterations:1000}
         $scope.selectionColor = 'rgb(42, 187, 155)';
         $scope.tag_selection_ID = [];
         $scope.user_selection_ID = [];
         $scope.corresponding_users_ID = [];
         $scope.corresponding_tags_ID = [];

         // When rootScope is ready load the graph
         $rootScope.$watch('ready', function(newVal) {
             if(newVal) {
                 $scope.layoutChoice = $rootScope.layout[12];
                 $scope.userGraphRessource = $resource(config.apiUrl + 'draw/usersToUsers/' + $scope.layoutChoice);
                 $scope.tagGraphRessource = $resource(config.apiUrl + 'draw/tagToTags/'+ $scope.layoutChoice);

                 $scope.drawUserGraph(true);
                 //$scope.drawTagGraph(true);
                 $scope.generateTagGraph();
                 //$scope.generateUserGraph();
                 $rootScope.resetSuggestions(false, false, false, false);
                 $rootScope.resetDetanglerSuggestions(true, true);
             }
         });

         $scope.fctUnion = function (tab_ini, tab_to_merge){
           if (tab_ini == undefined){
             tab_ini = [];
           }
           return [...new Set([...tab_ini ,...tab_to_merge])];
         }

         $scope.fctIntersect = function (tab_ini, tab_to_merge){
            if (tab_ini == undefined){
              return tab_to_merge;
            }
            else if (tab_ini.length == 0){
              return []
            }
            else{
              return [...new Set(tab_ini.filter(x => new Set(tab_to_merge).has(x)))];
              //new Set([...setA].filter(x => setB.has(x)));
            }
          }

          $scope.selectTagNodesVennfct = $scope.fctUnion;
          $scope.selectUserNodesVennfct = $scope.fctUnion;


         $rootScope.$watch("user_search", function() {
           if ($rootScope.user_search != undefined){
             $scope.wichSelection = "user";
             $scope.s_user.graph.nodes().filter(function (node){
               return node.user_id == $rootScope.user_search.user_id
             }).forEach(function (node){
               $scope.user_selection_ID = [parseInt(node.id)];
             });
             $scope.refreshUserView();
             $scope.refreshTagView();
             $rootScope.user_search = undefined;
           }
         });

         $rootScope.$watch("tag_search", function() {
           if ($rootScope.tag_search != undefined){
             $scope.wichSelection = "tag";
             $scope.s_tag.graph.nodes().filter(function (node){
               return node.tag_id == $rootScope.tag_search.tag_id
             }).forEach(function (node){
               $scope.tag_selection_ID = [parseInt(node.id)];
             });
             $scope.refreshTagView();
             $scope.refreshUserView();
             $rootScope.tag_search = undefined;
           }
         });

         $scope.refreshTagView = function(){

           if ($scope.is_tag_graph_intact == false){
             $scope.setInteractorTagLayoutReset();
           }

           //Set the default properties
           $scope.s_tag.graph.edges().forEach(function (edge) {
             edge.hidden = false;
           });

           $scope.s_tag.graph.nodes().forEach(function (node) {
             node.color = $scope.defaultTagNodeColor;
             node.hidden = true;
           });

           //We color what is selected and we keep those nodes + the nodes that are connected to the selection.
           if ($scope.wichSelection == "tag" && $scope.tag_selection_ID.length != 0){
             $scope.tag_selection_ID.forEach(function (node_id) {
               var node = $scope.s_tag.graph.nodes(node_id);
               node.hidden = false;
               node.color = $scope.selectionColor;
             });
             //We display what is connected to the selection
             $scope.s_tag.graph.edges().forEach(function (edge) {
               if ($scope.tag_selection_ID.indexOf(parseInt($scope.s_tag.graph.nodes(edge.target).id)) > -1){
                 $scope.s_tag.graph.nodes(edge.source).hidden = false;
               }
               if ($scope.tag_selection_ID.indexOf(parseInt($scope.s_tag.graph.nodes(edge.source).id)) > -1){
                 $scope.s_tag.graph.nodes(edge.target).hidden = false;
               }
             });
           }

           // if some user nodes are selected we will display only the tag nodes corresponding to the selecteion.
           $scope.corresponding_tags_ID = undefined;
           if ($scope.wichSelection == "user" && $scope.user_selection_ID.length != 0){
             $scope.s_user.graph.nodes().filter(function (node) {
               return $scope.user_selection_ID.indexOf(parseInt(node.id)) > -1
             }).forEach(function (node) {
                if (node.tagsAssociateNodeTlp != undefined) {
                  var text = node.tagsAssociateNodeTlp
                  var tab_few_tag = eval("[" + text.substring(1,text.length-1) + "]")
                }
                else{
                  var tab_few_tag = [];
                }
                $scope.corresponding_tags_ID = $scope.selectUserNodesVennfct($scope.corresponding_tags_ID,tab_few_tag);
             });

             if ($scope.corresponding_tags_ID.length != 0){
               $scope.s_tag.graph.nodes().filter(function (node) {
                  return $scope.corresponding_tags_ID.indexOf(parseInt(node.tag_id)) > -1
               }).forEach( function (node){
                 node.hidden = false;
                 node.color = $scope.selectionColor;
               });
             }
           }

           //if there is no selection or nothing has been match with the selection. We display all the graph.
           if ($scope.wichSelection == undefined || ($scope.wichSelection == "user" && ($scope.user_selection_ID.length == 0 || $scope.corresponding_tags_ID == undefined || $scope.corresponding_tags_ID.length == 0)) || ($scope.wichSelection == "tag" && $scope.tag_selection_ID.length == 0)){

             $scope.s_tag.graph.nodes().forEach(function (node) {
               node.hidden = false;
             });
           }

           //Now we filter with the co-occurence intensity
           $scope.s_tag.graph.nodes().forEach(function (node){
             if (Number(node[$scope.metricFilter]) < Number($scope.filter_occurence_tag_min) || Number(node[$scope.metricFilter]) > Number($scope.filter_occurence_tag_max)){
               node.hidden = true;
             }
           });

           $scope.s_tag.refresh();
         }

         $scope.refreshUserView = function(){

           if ($scope.is_user_graph_intact == false){
             $scope.setInteractorUserLayoutReset();
           }

           //Set the default properties
           $scope.s_user.graph.edges().forEach(function (edge) {
             edge.hidden = false;
           });

           $scope.s_user.graph.nodes().forEach(function (node) {
             node.color = $scope.defaultUserNodeColor;
             node.hidden = true;
           });

           //We color what is selected and we keep those nodes + the nodes that are connected to the selection.
           if ($scope.wichSelection == "user" && $scope.user_selection_ID.length != 0){
             $scope.user_selection_ID.forEach(function (node_id) {
               var node = $scope.s_user.graph.nodes(node_id);
               node.hidden = false;
               node.color = $scope.selectionColor;
             });
             //We display what is connected to the selection
             $scope.s_user.graph.edges().forEach(function (edge) {
               if ($scope.user_selection_ID.indexOf(parseInt($scope.s_user.graph.nodes(edge.target).id)) > -1){
                 $scope.s_user.graph.nodes(edge.source).hidden = false;
               }
               if ($scope.user_selection_ID.indexOf(parseInt($scope.s_user.graph.nodes(edge.source).id)) > -1){
                 $scope.s_user.graph.nodes(edge.target).hidden = false;
               }
             });
           }

           // if some tag nodes are selected we will display only the user nodes corresponding to the selecteion.
           $scope.corresponding_users_ID = undefined;
           if ($scope.wichSelection == "tag" && $scope.tag_selection_ID.length != 0){

             $scope.s_tag.graph.nodes().filter(function (node) {
               return $scope.tag_selection_ID.indexOf(parseInt(node.id)) > -1
             }).forEach(function (node) {
                if (node.usersAssociateNodeTlp != undefined) {
                  var text = node.usersAssociateNodeTlp
                  var tab_few_user = eval("[" + text.substring(1,text.length-1) + "]")
                }
                else{
                  var tab_few_user = [];
                }
                $scope.corresponding_users_ID = $scope.selectTagNodesVennfct($scope.corresponding_users_ID,tab_few_user);
             });

             if ($scope.corresponding_users_ID.length != 0){
               $scope.s_user.graph.nodes().filter( function (node){
                  return $scope.corresponding_users_ID.indexOf(parseInt(node.user_id)) > -1
               }).forEach( function (node){
                 node.hidden = false;
                 node.color = $scope.selectionColor;
               });
             }
           }

           //if there is no selection or nothing has been match with the selection. We display all the graph.
           if ($scope.wichSelection == undefined || ($scope.wichSelection == "tag" && ($scope.tag_selection_ID.length == 0 || $scope.corresponding_users_ID == undefined || $scope.corresponding_users_ID.length == 0)) || ($scope.wichSelection == "user" && $scope.user_selection_ID.length == 0)){

             $scope.s_user.graph.nodes().forEach(function (node) {
               node.hidden = false;
             });
           }

           //Now we hide the community Managers if the box is cheched
           if ($scope.isCheckedUser == true){
             $scope.s_user.graph.nodes().filter(function (node){
               return $scope.communityManagers.indexOf(node.name) > -1
             }).forEach(function (node){
               node.hidden = true;
             });
           }

           $scope.s_user.refresh();
         }


         //We want to bind the lasso when s_tag and s_user are ready
         var toUnBind1 = $scope.$watch("s_tag", function() {
           if ($scope.s_tag != undefined) {
             //When the lasso_user catch new nodes
             $scope.lasso_user.bind('selectedNodes', function (event) {
               $scope.wichSelection = "user";
               $scope.user_selection_ID = $scope.lasso_user.selectedNodes.map(function(node) {return parseInt(node.id);});
               $scope.refreshUserView();
               $scope.refreshTagView();
             });

             //When the lasso_tag catch new nodes
             $scope.lasso_tag.bind('selectedNodes', function (event) {
               $scope.wichSelection = "tag";
               $scope.tag_selection_ID = $scope.lasso_tag.selectedNodes.map(function(node) {return parseInt(node.id);});
               $scope.refreshTagView();
               $scope.refreshUserView();
             });

             var toUnBind2 = $scope.$watch("s_tag.ready", function (){
               if ($scope.s_tag.ready == true){
                 $scope.s_tag.graph.nodes().forEach(function (node) {
                   node.hidden = false;
                 });
                 $scope.s_tag.graph.edges().forEach(function (edge) {
                   edge.hidden = false;
                 });

                 $scope.tag_graph_intact.nodes = jQuery.extend(true,[], $scope.s_tag.graph.nodes());
                 $scope.tag_graph_intact.edges = jQuery.extend(true,[], $scope.s_tag.graph.edges());
                 toUnBind2();
               }
             });

             var toUnBind3 = $scope.$watch("s_user.ready", function (){
               if ($scope.s_user.ready == true){
                 $scope.s_user.graph.nodes().forEach(function (node) {
                   node.hidden = false;
                 });
                 $scope.s_user.graph.edges().forEach(function (edge) {
                   edge.hidden = false;
                 });

                 $scope.user_graph_intact.nodes = jQuery.extend(true,[], $scope.s_user.graph.nodes());
                 $scope.user_graph_intact.edges = jQuery.extend(true,[], $scope.s_user.graph.edges());
                 toUnBind3();
               }
             });

             toUnBind1(); //We stop the watcher wich is useless now.
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
                 $scope.refreshTagView();
             }
         });



         /*** user view ***/


         $scope.drawUserGraph = function (suggestions) {
             $scope.usersGraphSigmaDetangler = [];
             $scope.drawUserGraphPromise = $scope.userGraphRessource.get();
             $scope.drawUserGraphPromise.$promise.then(function (result) {
                 $scope.usersGraphSigmaDetangler = result;
                 $scope.defaultUserNodeColor = $scope.usersGraphSigmaDetangler.nodes[0].color
                 /*
                 if(suggestions) {
                     $rootScope.suggestions = [];
                     angular.forEach($scope.nodes, function (node) {
                         if (node.name != undefined) {
                             node.label = node.name;
                             $rootScope.suggestions.push(node);
                         }
                     });
                 }
                 */
             });
         };



         $scope.drawTagGraph = function (result) {
             $scope.tagsGraphSigmaDetangler = [];
             $scope.drawTagGraphPromise = $scope.tagGraphRessource.get();
             $scope.drawTagGraphPromise.$promise.then(function (result) {
                 $scope.tagsGraphSigmaDetangler = result;
                  $scope.defaultTagNodeColor = $scope.tagsGraphSigmaDetangler.nodes[0].color
             });
         };

         $scope.generateTagGraph = function () {
             //$scope.filter_occ = filter_occ;
             var createGraph = $resource(config.apiUrl + 'generateTagFullGraph/' + $scope.filter_occurence_tag_min + "/" + $scope.selected.start.getTime() + "/" + $scope.selected.end.getTime()+"/0");
             var createGraphPromise = createGraph.get();
             createGraphPromise.$promise.then(function (result) {
                 $scope.drawTagGraph();
             });
         };

         $scope.generateUserGraph = function () {
             //$scope.filter_occ = filter_occ;
             var createGraph = $resource(config.apiUrl + 'generateUserGraph');
             var createGraphPromise = createGraph.get();
             createGraphPromise.$promise.then(function (result) {
                 $scope.drawUserGraph();
             });
         };

         /******** Interactor Manager ********/
         $scope.clearUserInteractor = function() {
             document.getElementById("interactorUserNavigate").className="btn btn-default";
             //document.getElementById("interactorUserSelectNode").className="btn btn-default";
             document.getElementById("interactorUserDragNode").className="btn btn-default";
             document.getElementById("interactorUserLasso").className="btn btn-default";
             document.getElementById("interactorUserDescriptionLabel").innerHTML = "";
         }

         $scope.setInteractorUserNavigate = function () {
             $scope.clearUserInteractor();
             $scope.userinteractor="navigate";
             document.getElementById("interactorUserNavigate").className="btn btn-primary";
             document.getElementById("interactorUserDescriptionLabel").innerHTML = $("#interactorUserNavigate").attr("data-title");
         }

         $scope.setInteractorUserNodeSelection = function () {
             $scope.clearUserInteractor();
             $scope.userinteractor="nodeSelection";
             document.getElementById("interactorUserSelectNode").className="btn btn-primary";
             document.getElementById("interactorUserDescriptionLabel").innerHTML = $("#interactorUserSelectNode").attr("data-title");
         }

         $scope.setInteractorUserDragNode = function () {
             $scope.clearUserInteractor();
             $scope.userinteractor="dragNode";
             document.getElementById("interactorUserDragNode").className="btn btn-primary";
             document.getElementById("interactorUserDescriptionLabel").innerHTML = $("#interactorUserDragNode").attr("data-title");
         }

         $scope.setInteractorUserLasso = function () {
             $scope.clearUserInteractor();
             $scope.userinteractor="lasso";
             document.getElementById("interactorUserLasso").className="btn btn-primary";
             document.getElementById("interactorUserDescriptionLabel").innerHTML = $("#interactorUserLasso").attr("data-title");
         }


         $scope.clearUserVennInteractor = function() {
             document.getElementById("interactorUserUnion").className="btn btn-default";
             document.getElementById("interactorUserIntersect").className="btn btn-default";
         }

         $scope.setInteractorUserUnion = function () {
             $scope.clearUserVennInteractor();
             $scope.selectUserNodesVennfct = $scope.fctUnion;
             document.getElementById("interactorUserUnion").className="btn btn-primary";
             $scope.refreshTagView();
         }

         $scope.setInteractorUserIntersect = function () {
             $scope.clearUserVennInteractor();
             $scope.selectUserNodesVennfct = $scope.fctIntersect;
             document.getElementById("interactorUserIntersect").className="btn btn-primary";
             $scope.refreshTagView();
         }


         $scope.setInteractorUserRemoveManagers = function (check) {
           $scope.isCheckedUser = check;
           $scope.refreshUserView();
         }


         $scope.clearTagInteractor = function() {
             document.getElementById("interactorTagNavigate").className="btn btn-default";
             //document.getElementById("interactorTagSelectNode").className="btn btn-default";
             document.getElementById("interactorTagDragNode").className="btn btn-default";
             document.getElementById("interactorTagLasso").className="btn btn-default";
             document.getElementById("interactorTagDescriptionLabel").innerHTML = "";
         }

         $scope.setInteractorTagNavigate = function () {
             $scope.clearTagInteractor();
             $scope.taginteractor="navigate";
             document.getElementById("interactorTagNavigate").className="btn btn-primary";
             document.getElementById("interactorTagDescriptionLabel").innerHTML = $("#interactorTagNavigate").attr("data-title");
         }

         $scope.setInteractorTagNodeSelection = function () {
             $scope.clearTagInteractor();
             $scope.taginteractor="nodeSelection";
             document.getElementById("interactorTagSelectNode").className="btn btn-primary";
             document.getElementById("interactorTagDescriptionLabel").innerHTML = $("#interactorTagSelectNode").attr("data-title");
         }

         $scope.setInteractorTagDragNode = function () {
             $scope.clearTagInteractor();
             $scope.taginteractor="dragNode";
             document.getElementById("interactorTagDragNode").className="btn btn-primary";
             document.getElementById("interactorTagDescriptionLabel").innerHTML = $("#interactorTagDragNode").attr("data-title");
         }

         $scope.setInteractorTagLasso = function () {
             $scope.clearTagInteractor();
             $scope.taginteractor="lasso";
             document.getElementById("interactorTagLasso").className="btn btn-primary";
             document.getElementById("interactorTagDescriptionLabel").innerHTML = $("#interactorTagLasso").attr("data-title");
         }

         $scope.clearTagVennInteractor = function() {
             document.getElementById("interactorTagUnion").className="btn btn-default";
             document.getElementById("interactorTagIntersect").className="btn btn-default";
         }

         $scope.setInteractorTagUnion = function () {
             $scope.clearTagVennInteractor();
             $scope.selectTagNodesVennfct = $scope.fctUnion;
             document.getElementById("interactorTagUnion").className="btn btn-primary";
             $scope.refreshUserView();
         }

         $scope.setInteractorTagIntersect = function () {
             $scope.clearTagVennInteractor();
             $scope.selectTagNodesVennfct = $scope.fctIntersect;
             document.getElementById("interactorTagIntersect").className="btn btn-primary";
             $scope.refreshUserView();
         }

         /*
         $scope.setInteractorUserLayoutStop = function () {
           if (document.getElementById("interactorUserLayoutStop").className != "btn btn-primary"){
               document.getElementById("interactorUserLayoutStop").className="btn btn-primary";
               document.getElementById("interactorUserLayoutPlay").className="btn btn-default";

               $scope.s_user.stopForceAtlas2();
            }
         }
         */

         $scope.setInteractorUserLayoutPlay = function () {
           var nodeToAdd = [];
           var edgeToAdd = [];
           $scope.is_user_graph_intact = false;
           var nb_node = 0;

           $scope.s_user.graph.nodes().forEach(function (node) {
             if (node.hidden == false){
               nodeToAdd.push(jQuery.extend(true,{},node));
               nb_node = nb_node + 1;
             }
           });

            $scope.s_user.graph.edges().forEach(function (edge) {
              if ($scope.s_user.graph.nodes(edge.source).hidden == false && $scope.s_user.graph.nodes(edge.target).hidden == false){
                edgeToAdd.push(jQuery.extend(true,{},edge));
              }
           });

           $scope.s_user.graph.clear();

           nodeToAdd.forEach(function (node) {
             $scope.s_user.graph.addNode(node);
           });

           edgeToAdd.forEach(function (edge) {
             $scope.s_user.graph.addEdge(edge);
           });


            //$scope.s_user.killForceAtlas2();
            //$scope.s_user.startForceAtlas2($scope.configAtlasForceAlgo);
            if (nb_node <= 300){
              sigma.layouts.fruchtermanReingold.start($scope.s_user, $scope.configFruchtermanReingoldAlgo);
            }
            $scope.s_user.refresh();
         }

         $scope.setInteractorUserLayoutReset = function () {
           //$scope.setInteractorUserLayoutStop();
           $scope.s_user.graph.clear();

           $scope.user_graph_intact.nodes.forEach(function (node) {
             $scope.s_user.graph.addNode(jQuery.extend(true,{},node));
           })

           $scope.user_graph_intact.edges.forEach(function (edge) {
             $scope.s_user.graph.addEdge(jQuery.extend(true,{},edge));
           })
           $scope.is_user_graph_intact = true;
           $scope.s_user.refresh();
         }

         /*
         $scope.setInteractorTagLayoutStop = function () {
           if (document.getElementById("interactorTagLayoutStop").className != "btn btn-primary"){
             document.getElementById("interactorTagLayoutStop").className="btn btn-primary";
             document.getElementById("interactorTagLayoutPlay").className="btn btn-default";

             //$scope.s_tag.stopForceAtlas2();
           }

         }
         */

         $scope.setInteractorTagLayoutPlay = function () {
           var nodeToAdd = [];
           var edgeToAdd = [];
           $scope.is_tag_graph_intact = false;
           var nb_node = 0;

           $scope.s_tag.graph.nodes().forEach(function (node) {
             if (node.hidden == false){
               nodeToAdd.push(jQuery.extend(true,{},node));
               nb_node = nb_node + 1;
             }
           });

            $scope.s_tag.graph.edges().forEach(function (edge) {
              if ($scope.s_tag.graph.nodes(edge.source).hidden == false && $scope.s_tag.graph.nodes(edge.target).hidden == false){
                edgeToAdd.push(jQuery.extend(true,{},edge));
              }
           });

           $scope.s_tag.graph.clear();

           nodeToAdd.forEach(function (node) {
             $scope.s_tag.graph.addNode(node);
           });

           edgeToAdd.forEach(function (edge) {
             $scope.s_tag.graph.addEdge(edge);
           });



            //$scope.s_tag.killForceAtlas2();
            //$scope.s_tag.startForceAtlas2($scope.configAtlasForceAlgo);
            if (nb_node <= 300){
              sigma.layouts.fruchtermanReingold.start($scope.s_tag, $scope.configFruchtermanReingoldAlgo);
            }
            $scope.s_tag.refresh();
         }

         $scope.setInteractorTagLayoutReset = function () {
           //$scope.setInteractorTagLayoutStop();
           $scope.s_tag.graph.clear();

           $scope.tag_graph_intact.nodes.forEach(function (node) {
             $scope.s_tag.graph.addNode(jQuery.extend(true,{},node));
           })

           $scope.tag_graph_intact.edges.forEach(function (edge) {
             $scope.s_tag.graph.addEdge(jQuery.extend(true,{},edge));
           })

           $scope.is_tag_graph_intact = true;
           $scope.s_tag.refresh();
         }



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
