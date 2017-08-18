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
         $scope.requestFullTagGraph = false;
         $scope.showTagCommonContent = false;
         $scope.tableSizeChoice = '10';
         $scope.userinteractor = "navigate";
         $scope.taginteractor = "navigate";
         $scope.infoPanelParent = "infoPanelParent";
         $scope.selected = {}; //test
         $scope.selected.start= new Date(0);
         $scope.selected.end= new Date(Date.now());
         $scope.layoutChoice = 'Circular';
         $scope.s_user = undefined;
         $scope.s_tag = undefined;
         $scope.lasso_user = {};
         $scope.lasso_tag = {};
         $scope.wichSelection = undefined;
         $scope.communityManagers = ["Alberto", "Nadia", "Noemi"];
         $scope.metricFilter = "occ";
         //$scope.configAtlasForceAlgo = {scalingRatio:1,strongGravityMode:false,gravity:3,adjustSizes:true};
         $scope.configFruchtermanReingoldAlgo = {iterations:1000, easing:"quadraticInOut", duration:2000}
         $scope.selectionColor = 'rgb(128, 0, 128)';
         $scope.correspondingColor = 'rgb(42, 187, 155)';
         $scope.corresponding_users_ID = [];
         $scope.corresponding_tags_ID = [];
         $scope.sigmaInstances = [];
         $scope.cntrlIsPressed = false;

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
                 $rootScope.resetSuggestions(false, true, false, false); // We can search post in the main search bar
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
            if (tab_ini == undefined || tab_ini === "all"){
              return tab_to_merge;
            }
            else if (tab_to_merge === "all"){
              return tab_ini;
            }
            else if (tab_ini.length == 0){
              return []
            }
            else{
              return [...new Set(tab_ini.filter(x => new Set(tab_to_merge).has(x)))];
            }
          }

          $scope.selectTagNodesVennfct = $scope.fctUnion;
          $scope.selectUserNodesVennfct = $scope.fctUnion;

          //To Do : select the users and the tag in the choosen post.
          $rootScope.$watch("search", function() {
            if ($rootScope.search != undefined){
              //$scope.wichSelection = "main_search_bar";
              console.log($rootScope.search);
              var drawGraph = $resource(config.apiUrl + 'post/hydrate/'+ $rootScope.search.post_id);
              var drawgraph = drawGraph.get();
              drawgraph.$promise.then(function (result) {
                  console.log(result);
              });
              $rootScope.search = undefined;
            }
          });



         $rootScope.$watch("user_search", function() {
           if ($rootScope.user_search != undefined){
             $scope.s_user.graph.nodes().filter(function (node){
               return node.user_id == $rootScope.user_search.user_id
             }).forEach(function (node){
               var selection_id = [parseInt(node.id)];
               if ($scope.cntrlIsPressed){
                 $scope.s_user.selection_ID = [...new Set([...$scope.s_user.selection_ID ,...selection_id])]; //Union
               }
               else{
                 $scope.s_user.selection_ID = selection_id;
               }
               $scope.searchWhatToDisplay();
             });
             $rootScope.user_search = undefined;
           }
         });

         $rootScope.$watch("tag_search", function() {
           if ($rootScope.tag_search != undefined){
             $scope.s_tag.graph.nodes().filter(function (node){
               return node.tag_id == $rootScope.tag_search.tag_id
             }).forEach(function (node){
               var selection_id = [parseInt(node.id)];
               if ($scope.cntrlIsPressed){
                 $scope.s_tag.selection_ID = [...new Set([...$scope.s_tag.selection_ID ,...selection_id])]; //Union
               }
               else{
                 $scope.s_tag.selection_ID = selection_id;
               }
               $scope.searchWhatToDisplay();
             });
             $rootScope.tag_search = undefined;
           }
         });

         $rootScope.$watch("post_search", function() {
           if ($rootScope.post_search != undefined){
             $scope.s_post.graph.nodes().filter(function (node){
               return node.post_id == $rootScope.post_search.post_id
             }).forEach(function (node){
               var selection_id = [parseInt(node.id)];
               if ($scope.cntrlIsPressed){
                 $scope.s_post.selection_ID = [...new Set([...$scope.s_post.selection_ID ,...selection_id])]; //Union
               }
               else{
                 $scope.s_post.selection_ID = selection_id;
               }
               $scope.searchWhatToDisplay();
             });
             $rootScope.post_search = undefined;
           }
         });


         $scope.refreshView = function(sigmaIns,layout){
           //Set the default properties
           //$scope.s_tag.graph.edges().forEach(function (edge) {
           // edge.hidden = false;
           //})
           sigmaIns.graph.nodes().forEach(function (node) {
             node.color = sigmaIns.defaultNodeColor;
             node.hidden = true;
             node.status = "hide";
           });

           if (sigmaIns.toDisplay_ID === "all"){
             sigmaIns.graph.nodes().forEach(function (node) {

               var to_show = true;
               sigmaIns.filters.forEach(function (filter) {
                 to_show = to_show && filter.apply(node);
               });
               if (to_show){
                  node.hidden = false;
               }

             });
           }
           else{

             //We show and color what is in the toDisplay_ID array if it is not filtered.
             if (sigmaIns.toDisplay_ID.length != 0){
                 sigmaIns.toDisplay_ID.forEach(function (node_id) {
                 var node = sigmaIns.graph.nodes(node_id);
                 var to_show = true;
                 sigmaIns.filters.forEach(function (filter) {
                   to_show = to_show && filter.apply(node);
                 });
                 if (to_show){
                    node.hidden = false;

                    //if the node is selected we color it with the selectionColor. Otherwise we use the correspondingColor.
                    if (sigmaIns.selection_ID.indexOf(node_id) > -1){
                      node.color = $scope.selectionColor;
                      node.status = "display";
                    }
                    else{
                      node.color = $scope.correspondingColor;
                      node.status = "display";
                    }
                 }

               });


               //We display what is connected to the selection
               if (sigmaIns.showNeighbour){
                 sigmaIns.graph.edges().forEach(function (edge) {
                   var node_source = sigmaIns.graph.nodes(edge.source);
                   var node_target = sigmaIns.graph.nodes(edge.target);
                   if (node_target.status == "display"){

                     var to_show = true;
                     sigmaIns.filters.forEach(function (filter) {
                       to_show = to_show && filter.apply(node_source);
                     });

                     if (to_show){node_source.hidden = false;}


                   }
                   if (node_source.status == "display"){

                     var to_show = true;
                     sigmaIns.filters.forEach(function (filter) {
                       to_show = to_show && filter.apply(node_target);
                     });

                     if (to_show){node_target.hidden = false;}
                   }
                 });
              }
             }
           }
           sigmaIns.refresh();
           if (layout === "fruchtermanReingold"){$scope.setInteractorLayoutPlayFruchterman(sigmaIns);}
         }

         /*
         $scope.refreshTagView = function(){
           //to delete
           $scope.user_selection_ID = $scope.s_user.selection_ID;
            $scope.tag_selection_ID = $scope.s_tag.selection_ID;
           //Set the default properties
           $scope.s_tag.graph.edges().forEach(function (edge) {
             edge.hidden = false;
           });
           $scope.s_tag.graph.nodes().forEach(function (node) {
             node.color = $scope.s_tag.defaultNodeColor;
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
         */

         /*
         $scope.refreshUserView = function(){
           console.log("user")
           $scope.user_selection_ID = $scope.s_user.selection_ID;
           $scope.tag_selection_ID = $scope.s_tag.selection_ID;

           //Set the default properties
           $scope.s_user.graph.edges().forEach(function (edge) {
             edge.hidden = false;
           });

           $scope.s_user.graph.nodes().forEach(function (node) {
             node.color = $scope.s_user.defaultNodeColor;
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
         */


         $scope.setLayoutBind = function(listener,sigmaIns){

           listener.bind('stop', function(event){
               //We want to rescale what is hidden. The refresh methode will then have a good behaviour.
               //We search what a the new camera bounds of the not hidden nodes.

               var mx2 = Number.POSITIVE_INFINITY;
               var Mx2 = Number.NEGATIVE_INFINITY;
               var my2 = Number.POSITIVE_INFINITY;
               var My2 = Number.NEGATIVE_INFINITY;

               sigmaIns.graph.nodes().forEach(function (node){
                 if (node.x < mx2){mx2 = node.x;}
                 if (node.x > Mx2){Mx2 = node.x;}
                 if (node.y < my2){my2 = node.y;}
                 if (node.y > My2){My2 = node.y;}
               });

               var Mx1 = sigmaIns.xmax;
               var mx1 = sigmaIns.xmin;
               var My1 = sigmaIns.ymax;
               var my1 = sigmaIns.ymin;

               sigmaIns.xmax = Mx2;
               sigmaIns.xmin = mx2;
               sigmaIns.ymax = My2;
               sigmaIns.ymin = my2;

               //Then we we do a translation and an homothétie of the hidden nodes.
               var Rx = (Mx1 - mx1 != 0 ? (Mx2 - mx2) / (Mx1 - mx1) : 1); // We avoid division by 0;
               var Ry = (My1 - my1 != 0 ? (My2 - my2) / (My1 - my1) : 1);

               sigmaIns.nodeNotToChange.forEach(function (node) {
                 node.x = (node.x - mx1)*Rx + mx2;
                 node.y = (node.y - my1)*Ry + my2;
                 sigmaIns.graph.addNode(node);
               });
               sigmaIns.edgeNotToChange.forEach(function (edge) {
                 sigmaIns.graph.addEdge(edge);
               });
             });
         }


         $scope.removeForbiddenNodes = function (sigmaIns, tab_to_filter) {
           return tab_to_filter.filter(function (node_id) {
             var node = sigmaIns.graph.nodes(node_id);
             var to_show = true;
             sigmaIns.filters.forEach(function (filter) {
               to_show = to_show && filter.apply(node);
             });
             return to_show
           });
        }



         $scope.searchWhatToDisplay = function () {
           if ($scope.sigmaInstances.length == 2){

             // sigmaIns.l1 correspond to the user that may be display
             // sigmaIns.l2 correspond to the tags that may be display
             $scope.s_user.l1 = $scope.removeForbiddenNodes($scope.s_user, $scope.s_user.selection_ID);
             if ($scope.s_user.l1.length != 0){
               var nodeTlp = undefined;
               $scope.s_user.l1.forEach( function (node_id) {
                 var node = $scope.s_user.graph.nodes(node_id);
                 if (node.tagsAssociateNodeTlp != undefined) {
                   var text = node.tagsAssociateNodeTlp;
                   var tab_few_tag = eval("[" + text.substring(1,text.length-1) + "]")
                 }
                 else{
                   var tab_few_tag = [];
                 }
                 nodeTlp = $scope.s_user.selectNodesVennfct(nodeTlp,tab_few_tag);
               });

               //We search the corresponding tag nodes
               $scope.s_user.l2 = [];
               if (nodeTlp.length != 0){
                 $scope.s_tag.graph.nodes().filter( function (node) {
                    return nodeTlp.indexOf(parseInt(node.tag_id)) > -1
                 }).forEach( function (node){
                   $scope.s_user.l2.push(parseInt(node.id));
                 });
               }

             }
             else{
               $scope.s_user.l1 = "all";
               $scope.s_user.l2 = "all";
             }

           $scope.s_tag.l2 = $scope.removeForbiddenNodes($scope.s_tag, $scope.s_tag.selection_ID);

           if ($scope.s_tag.l2.length != 0){
             var nodeTlp = undefined;
             $scope.s_tag.l2.forEach( function (node_id) {
               var node = $scope.s_tag.graph.nodes(node_id);
               if (node.usersAssociateNodeTlp != undefined) {
                 var text = node.usersAssociateNodeTlp;
                 var tab_few_user = eval("[" + text.substring(1,text.length-1) + "]")
               }
               else{
                 var tab_few_user = [];
               }
               nodeTlp = $scope.s_tag.selectNodesVennfct(nodeTlp,tab_few_user);
             });

             //We search the corresponding user nodes
             $scope.s_tag.l1 = []
             if (nodeTlp.length != 0){
               $scope.s_user.graph.nodes().filter( function (node){
                  return nodeTlp.indexOf(parseInt(node.user_id)) > -1
               }).forEach( function (node){
                 $scope.s_tag.l1.push(parseInt(node.id));
               });
             }




           }
           else{
             $scope.s_tag.l1 = "all";
             $scope.s_tag.l2 = "all";
           }

           $scope.s_user.toDisplay_ID = $scope.fctIntersect($scope.s_user.l1, $scope.s_tag.l1);
           //We remove the nodes that are not respecting the filters.
           $scope.s_tag.toDisplay_ID = $scope.fctIntersect($scope.s_user.l2, $scope.s_tag.l2);

           //The current lasso selection must correspond to what is displayed.
           //if ($scope.s_user.toDisplay_ID != "all"){$scope.s_user.selection_ID = $scope.s_user.toDisplay_ID;}
           //if ($scope.s_tag.selection_ID != "all"){$scope.s_tag.selection_ID = $scope.s_tag.toDisplay_ID;}


           //$scope.s_user.toDisplay_ID = $scope.s_user.selection_ID;
           //$scope.refreshView($scope.s_user,"fruchtermanReingold");
           $scope.refreshView($scope.s_user,false);
           //$scope.s_tag.toDisplay_ID = $scope.s_tag.selection_ID;
           $scope.refreshView($scope.s_tag,false);

          }
        }

         $scope.initializeSigmaInstance = function (sigmaIns, lasso, checkUnique) {
           sigmaIns.filters = []; // We initialize the filters.
           sigmaIns.selection_ID = [];
           sigmaIns.toDisplay_ID = [];
           sigmaIns.selectNodesVennfct = $scope.fctUnion;
           $scope.sigmaInstances.push(sigmaIns);

           //When the lasso_tag catch new nodes
           lasso.bind('selectedNodes', function (event) {
             $scope.wichSelection = "user";
             var lasso_selection_id = lasso.selectedNodes.map(function(node) {return parseInt(node.id);});
             if (sigmaIns.selection_ID != "all" && $scope.cntrlIsPressed){
               sigmaIns.selection_ID = [...new Set([...sigmaIns.selection_ID ,...lasso_selection_id])]; //Union
             }
             else{
               sigmaIns.selection_ID = lasso_selection_id;
             }
             $scope.searchWhatToDisplay();
             //$scope.refreshTagView();
             //$scope.refreshUserView();
           });

           //We want to now the xmin, xmax, ymin, ymax of the nodes.
           var xmin = Number.POSITIVE_INFINITY;
           var xmax = Number.NEGATIVE_INFINITY;
           var ymin = Number.POSITIVE_INFINITY;
           var ymax = Number.NEGATIVE_INFINITY;

           if (checkUnique){
             var nodes_id = [];
             var nodesToAdd = [];

             sigmaIns.graph.nodes().forEach(function (node) {
               if (nodes_id.indexOf(parseInt(node.user_id)) <= -1){
                 node.hidden = false;
                 nodes_id.push(node.user_id);
                 nodesToAdd.push(node);
                 if (node.x < xmin){xmin = node.x;}
                 if (node.x > xmax){xmax = node.x;}
                 if (node.y < ymin){ymin = node.y;}
                 if (node.y > ymax){ymax = node.y;}
               }
             });

             var edges_source_target = [];
             var edgesToAdd = [];

             sigmaIns.graph.edges().forEach(function (edge){
               if (edges_source_target[edge.source] == undefined){
                 edges_source_target[edge.source] = [];
               }
               if (edges_source_target[edge.source].indexOf(edge.target) <= -1){
               edges_source_target[edge.source].push(edge.target);
               edge.hidden = false;
               edgesToAdd.push(edge);
                }
             });

             sigmaIns.graph.clear();

             nodesToAdd.forEach(function (node) {
               sigmaIns.graph.addNode(node);
             })


             edgesToAdd.forEach(function (edge) {
               sigmaIns.graph.addEdge(edge);
             })
           }
           else{
             sigmaIns.graph.nodes().forEach(function (node) {
               node.hidden = false;
               if (node.x < xmin){xmin = node.x;}
               if (node.x > xmax){xmax = node.x;}
               if (node.y < ymin){ymin = node.y;}
               if (node.y > ymax){ymax = node.y;}
             });

             sigmaIns.graph.edges().forEach(function (edge) {
               edge.hidden = false;
             });
           }

           sigmaIns.xmin = xmin;
           sigmaIns.xmax = xmax;
           sigmaIns.ymin = ymin;
           sigmaIns.ymax = ymax;
           sigmaIns.xmin_intact = xmin;
           sigmaIns.xmax_intact = xmax;
           sigmaIns.ymin_intact = ymin;
           sigmaIns.ymax_intact = ymax;

           sigmaIns.graph_intact = {};
           sigmaIns.graph_intact.nodes = jQuery.extend(true,[], sigmaIns.graph.nodes());
           sigmaIns.graph_intact.edges = jQuery.extend(true,[], sigmaIns.graph.edges());
           sigmaIns.refresh();
         }

         //s_tag is the last to be ready so the other sigma instances are ready too.
         var toUnBind1 = $scope.$watch("s_tag", function() {
           if ($scope.s_tag != undefined) {

             var toUnBind2 = $scope.$watch("s_tag.ready", function (){
               if ($scope.s_tag.ready == true){
                 $scope.initializeSigmaInstance($scope.s_tag, $scope.lasso_tag, false);
                 var listener_tag = sigma.layouts.fruchtermanReingold.configure($scope.s_tag, $scope.configFruchtermanReingoldAlgo);
                 $scope.setLayoutBind(listener_tag, $scope.s_tag);

                 //We add the filters that are bind to this sigma Instance.
                 var occIntensity = {};
                 occIntensity.apply = function (node) {
                   return Number(node[$scope.metricFilter]) >= Number($scope.filter_occurence_tag_min) && Number(node[$scope.metricFilter]) <= Number($scope.filter_occurence_tag_max)
                 }
                 $scope.s_tag.filters.push(occIntensity);

                 toUnBind2();
               }
             });

             var toUnBind3 = $scope.$watch("s_user.ready", function (){
               if ($scope.s_user.ready == true){
                 $scope.initializeSigmaInstance($scope.s_user, $scope.lasso_user, true); //We want the nodes and the edges to be unique
                 var listener_user = sigma.layouts.fruchtermanReingold.configure($scope.s_user, $scope.configFruchtermanReingoldAlgo);
                 $scope.setLayoutBind(listener_user,$scope.s_user);

                 //We add the filters that are bind to this sigma Instance.
                 var removeManagers = {};
                 removeManagers.isChecked = false;
                 removeManagers.apply = function (node) {
                   //If the filter "remove managers" is checked and the node is a community Managers then we don't display it"
                   if (this.isChecked == true && $scope.communityManagers.indexOf(node.name) > -1){
                     return false;
                   }
                   else{
                     return true;
                   }
                 }
                 //We add the filter to the filters. We will call the .apply function.
                 $scope.s_user.filters.push(removeManagers);



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
                 $scope.searchWhatToDisplay();
             }
         });



         /*** user view ***/


         $scope.drawUserGraph = function (suggestions) {
             $scope.usersGraphSigmaDetangler = [];
             $scope.drawUserGraphPromise = $scope.userGraphRessource.get();
             $scope.drawUserGraphPromise.$promise.then(function (result) {
                 $scope.usersGraphSigmaDetangler = result;
                 $scope.s_user.defaultNodeColor = $scope.usersGraphSigmaDetangler.nodes[0].color
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
                  $scope.s_tag.defaultNodeColor = $scope.tagsGraphSigmaDetangler.nodes[0].color
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
             document.getElementById("interactorUserDragNode").className="btn btn-default";
             document.getElementById("interactorUserLasso").className="btn btn-default";
             document.getElementById("interactorUserInfo").className="btn btn-default";
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
         $scope.setInteractorUserInfo = function () {
             $scope.clearUserInteractor();
             $scope.userinteractor="information";
             document.getElementById("interactorUserInfo").className="btn btn-primary";
             document.getElementById("interactorUserDescriptionLabel").innerHTML = $("#interactorUserInfo").attr("data-title");
         }


         $scope.clearUserVennInteractor = function() {
             document.getElementById("interactorUserUnion").className="btn btn-default";
             document.getElementById("interactorUserIntersect").className="btn btn-default";
         }

         $scope.setInteractorUserUnion = function () {
             $scope.clearUserVennInteractor();
             $scope.s_user.selectNodesVennfct = $scope.fctUnion;
             document.getElementById("interactorUserUnion").className="btn btn-primary";
             $scope.searchWhatToDisplay();
         }

         $scope.setInteractorUserIntersect = function () {
             $scope.clearUserVennInteractor();
             $scope.s_user.selectNodesVennfct = $scope.fctIntersect;
             document.getElementById("interactorUserIntersect").className="btn btn-primary";
             $scope.searchWhatToDisplay();
         }


         $scope.setInteractorUserRemoveManagers = function (check) {
           $scope.s_user.filters[0].isChecked = check;
           $scope.searchWhatToDisplay();
         }


         $scope.clearTagInteractor = function() {
             document.getElementById("interactorTagNavigate").className="btn btn-default";
             //document.getElementById("interactorTagSelectNode").className="btn btn-default";
             document.getElementById("interactorTagDragNode").className="btn btn-default";
             document.getElementById("interactorTagLasso").className="btn btn-default";
             document.getElementById("interactorTagInfo").className="btn btn-default";
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

         $scope.setInteractorTagInfo = function () {
             $scope.clearTagInteractor();
             $scope.taginteractor="information";
             document.getElementById("interactorTagInfo").className="btn btn-primary";
             document.getElementById("interactorTagDescriptionLabel").innerHTML = $("#interactorTagInfo").attr("data-title");
         }

         $scope.clearTagVennInteractor = function() {
             document.getElementById("interactorTagUnion").className="btn btn-default";
             document.getElementById("interactorTagIntersect").className="btn btn-default";
         }

         $scope.setInteractorTagUnion = function () {
             $scope.clearTagVennInteractor();
             $scope.s_tag.selectNodesVennfct = $scope.fctUnion;
             document.getElementById("interactorTagUnion").className="btn btn-primary";
             $scope.searchWhatToDisplay();
         }

         $scope.setInteractorTagIntersect = function () {
             $scope.clearTagVennInteractor();
             $scope.s_tag.selectNodesVennfct = $scope.fctIntersect;
             document.getElementById("interactorTagIntersect").className="btn btn-primary";
             $scope.searchWhatToDisplay();
         }


         //General function that change the layout of the not hidden node.
         $scope.setInteractorLayoutPlayFruchterman = function(sigma_instance){
           var nodeToChange = [];
           var edgeToChange = [];
           sigma_instance.nodeNotToChange = [];
           sigma_instance.edgeNotToChange = [];
           var nb_node = 0;


           sigma_instance.graph.nodes().forEach(function (node) {
             if (node.hidden == false){
               nodeToChange.push(node);
               nb_node = nb_node + 1;
             }
             else{
               sigma_instance.nodeNotToChange.push(node);
             }
           });

            sigma_instance.graph.edges().forEach(function (edge) {
              if (sigma_instance.graph.nodes(edge.source).hidden == false && sigma_instance.graph.nodes(edge.target).hidden == false){
                edgeToChange.push(edge);
              }
              else{
                sigma_instance.edgeNotToChange.push(edge);
              }
           });

           sigma_instance.graph.clear();

           nodeToChange.forEach(function (node) {
             sigma_instance.graph.addNode(node);
           });
           edgeToChange.forEach(function (edge) {
             sigma_instance.graph.addEdge(edge);
           });

            if (nb_node <= 300){
              sigma.layouts.fruchtermanReingold.start(sigma_instance);
            }

            sigma_instance.refresh();
         }

         $scope.setInteractorLayoutReset = function (sigma_instance){
           sigma_instance.graph.clear();

           sigma_instance.graph_intact.nodes.forEach(function (node) {
             sigma_instance.graph.addNode(jQuery.extend(true,{},node));
           });

           sigma_instance.graph_intact.edges.forEach(function (edge) {
             sigma_instance.graph.addEdge(jQuery.extend(true,{},edge));
           })
           sigma_instance.xmin = sigma_instance.xmin_intact;
           sigma_instance.xmax = sigma_instance.xmax_intact;
           sigma_instance.ymin = sigma_instance.ymin_intact;
           sigma_instance.ymax = sigma_instance.ymax_intact;

           $scope.searchWhatToDisplay();

         }

         $scope.setInteractorShowNeighbour = function(sigma_instance, isCheckedShowNeighbour){
           sigma_instance.showNeighbour = isCheckedShowNeighbour;
           $scope.searchWhatToDisplay();
         }

         $scope.openInfoPanel = function(elementType, elementId) {
             var mod = document.createElement("panel-info");
             mod.setAttribute("type", elementType);
             mod.setAttribute("id", elementId);
             mod.setAttribute("parent", $scope.infoPanelParent);
             jQuery("#"+ $scope.infoPanelParent).append(mod);
             $compile(mod)($scope);
         };


         /*** Sigma Event Catcher ***/
         $scope.eventCatcher = function (e) {
             switch(e.type) {
                 case 'clickNode':
                         if(e.data.node.user_id != undefined && (e.data.captor.ctrlKey || $scope.userinteractor == "information")) {
                             $scope.elementType = "user";
                             $scope.elementId = e.data.node.user_id
                             $scope.openInfoPanel($scope.elementType, $scope.elementId);
                         }
                         else if (e.data.node.post_id != undefined) {
                             $scope.elementType = "post";
                             $scope.elementId = e.data.node.post_id;
                         }
                         else if (e.data.node.comment_id != undefined) {
                             $scope.elementType = "comment";
                             $scope.elementId = e.data.node.comment_id;
                         }
                         else if (e.data.node.tag_id != undefined && (e.data.captor.ctrlKey || $scope.taginteractor == "information")) {
                             $scope.elementType = "tag";
                             $scope.elementId = e.data.node.tag_id;
                             $scope.openInfoPanel($scope.elementType, $scope.elementId);
                         }
                         else if (e.data.node.annotation_id != undefined) {
                             $scope.elementType = "annotation";
                             $scope.elementId = e.data.node.annotation_id;
                         }
                     break;
            }
        }

        $(document).keydown(function(event) {

            if (event.which == "17"){$scope.cntrlIsPressed = true;}
        });

        $(document).keyup(function(event) {
            if (event.which == "17"){$scope.cntrlIsPressed = false;}
        });




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
