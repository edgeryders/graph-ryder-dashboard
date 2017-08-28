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
         $scope.nodeTagelThreshold = 10;
         $scope.nodeTagelThresholdMax = 10;
         $scope.nodeUserelThresholdMax = 10;
         $scope.nodeUserelThreshold = 10;
         $scope.nodePostelThresholdMax = 10;
         $scope.nodePostelThreshold = 10;
         $scope.locate = "";
         $scope.filter_occurence_tag_min = "2";
         $scope.filter_occurence_tag_max = "100";
         $scope.requestFullTagGraph = false;
         $scope.showTagCommonContent = false;
         $scope.tableSizeChoice = '10';
         $scope.userinteractor = "navigate";
         $scope.taginteractor = "navigate";
         $scope.postinteractor = "navigate";
         $scope.infoPanelParent = "infoPanelParent";
         $scope.selected = {}; //test
         $scope.selected.start= new Date(0);
         $scope.selected.end= new Date(Date.now());
         $scope.layoutChoice = 'Circular';
         $scope.s_user = undefined;
         $scope.s_tag = undefined;
         $scope.s_post = undefined;
         $scope.lasso_user = {};
         $scope.lasso_tag = {};
         $scope.lass_post = {};
         $scope.communityManagers = ["Alberto", "Nadia", "Noemi"];
         $scope.metricFilter = "occ";
         //$scope.configAtlasForceAlgo = {scalingRatio:1,strongGravityMode:false,gravity:3,adjustSizes:true};
         $scope.configFruchtermanReingoldAlgo = {iterations:1000, easing:"quadraticInOut", duration:1300}
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
                 $scope.postGraphRessource = $resource(config.apiUrl + 'draw/commentAndPost/'+ $scope.layoutChoice);
                 //$scope.postGraphRessource = $resource(config.apiUrl + 'draw/complete/'+ $scope.layoutChoice);
                 $scope.drawUserGraph(true);
                 $scope.drawCommentAndPostGraph(true);
                 $scope.drawTagGraph(true);
                 //$scope.generateTagGraph();
                 //$scope.generateUserGraph();
                 //$scope.generateCommentAndPostGraph();
                 //$rootScope.resetSuggestions(false, true, false, false); // We can search post in the main search bar
                 $rootScope.resetDetanglerSuggestions(true, true, true); // the suggestions of users, tags and posts are loaded.
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
             node.color = node.defaultNodeColor;
             node.hidden = true;
             node.status = "hide";
           });

           if (sigmaIns.toDisplay_ID === "all"){
             sigmaIns.graph.nodes().forEach(function (node) {

               var to_show = true;

               sigmaIns.filtersWhenAll.forEach(function (filter) {
                 if (to_show){
                   to_show = to_show && filter.apply(node);
                 }
               });

               sigmaIns.filters.forEach(function (filter) {
                 if (to_show){
                   to_show = to_show && filter.apply(node);
                 }
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
                   if (to_show){
                     to_show = to_show && filter.apply(node);
                   }
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
                       if (to_show){
                         to_show = to_show && filter.apply(node_source);
                       }
                     });

                     if (to_show){node_source.hidden = false;}


                   }
                   if (node_source.status == "display"){

                     var to_show = true;
                     sigmaIns.filters.forEach(function (filter) {
                       if (to_show){
                         to_show = to_show && filter.apply(node_target);
                       }
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
          else if ($scope.sigmaInstances.length == 3) {
            // sigmaIns.l1 correspond to the user that may be display
            // sigmaIns.l2 correspond to the tags that may be display
            // sigmaIns.l3 correspond to the posts that may be display
            $scope.s_user.l1 = $scope.removeForbiddenNodes($scope.s_user, $scope.s_user.selection_ID);
            if ($scope.s_user.l1.length != 0){
              var tagNodeTlp = undefined;
              var postNodeTlp = undefined;
              $scope.s_user.l1.forEach( function (node_id) {
                var node = $scope.s_user.graph.nodes(node_id);

                if (node.tagsAssociateNodeTlp != undefined) {
                  var text = node.tagsAssociateNodeTlp;
                  var tab_few_tag = eval("[" + text.substring(1,text.length-1) + "]")
                }
                else{
                  var tab_few_tag = [];
                }

                if (node.postsOrCommentsAssociateNodeTlp != undefined) {
                  var text = node.postsOrCommentsAssociateNodeTlp;
                  var tab_few_post = eval("[" + text.substring(1,text.length-1) + "]")
                }
                else{
                  var tab_few_post = [];
                }

                postNodeTlp = $scope.s_user.selectNodesVennfct(postNodeTlp,tab_few_post);
                tagNodeTlp = $scope.s_user.selectNodesVennfct(tagNodeTlp,tab_few_tag);
              });

              //We search the corresponding tag nodes
              $scope.s_user.l2 = [];
              if (tagNodeTlp.length != 0){
                $scope.s_tag.graph.nodes().filter( function (node) {
                   return tagNodeTlp.indexOf(parseInt(node.tag_id)) > -1
                }).forEach( function (node){
                  $scope.s_user.l2.push(parseInt(node.id));
                });
              }

              //We search the corresponding post or comment nodes
              $scope.s_user.l3 = [];
              if (postNodeTlp.length != 0){
                $scope.s_post.graph.nodes().filter( function (node) {
                  if(node.post_id != undefined){
                    return postNodeTlp.indexOf(parseInt(node.post_id)) > -1
                  }
                  else{
                    return postNodeTlp.indexOf(parseInt(node.comment_id)) > -1
                  }
                }).forEach( function (node){
                  $scope.s_user.l3.push(parseInt(node.id));
                });
              }

            }
            else{
              $scope.s_user.l1 = "all";
              $scope.s_user.l2 = "all";
              $scope.s_user.l3 = "all";
            }

          $scope.s_tag.l2 = $scope.removeForbiddenNodes($scope.s_tag, $scope.s_tag.selection_ID);

          if ($scope.s_tag.l2.length != 0){
            var userNodeTlp = undefined;
            var postNodeTlp = undefined;
            $scope.s_tag.l2.forEach( function (node_id) {
              var node = $scope.s_tag.graph.nodes(node_id);

              if (node.usersAssociateNodeTlp != undefined) {
                var text = node.usersAssociateNodeTlp;
                var tab_few_user = eval("[" + text.substring(1,text.length-1) + "]")
              }
              else{
                var tab_few_user = [];
              }

              if (node.postsOrCommentsAssociateNodeTlp != undefined) {
                var text = node.postsOrCommentsAssociateNodeTlp;
                var tab_few_post = eval("[" + text.substring(1,text.length-1) + "]")
              }
              else{
                var tab_few_post = [];
              }

              postNodeTlp = $scope.s_tag.selectNodesVennfct(postNodeTlp,tab_few_post);
              userNodeTlp = $scope.s_tag.selectNodesVennfct(userNodeTlp,tab_few_user);
            });

            //We search the corresponding user nodes
            $scope.s_tag.l1 = []
            if (userNodeTlp.length != 0){
              $scope.s_user.graph.nodes().filter( function (node){
                 return userNodeTlp.indexOf(parseInt(node.user_id)) > -1
              }).forEach( function (node){
                $scope.s_tag.l1.push(parseInt(node.id));
              });
            }

            //We search the corresponding post nodes
            $scope.s_tag.l3 = [];
            if (postNodeTlp.length != 0){
              $scope.s_post.graph.nodes().filter( function (node) {
                if(node.post_id != undefined){
                  return postNodeTlp.indexOf(parseInt(node.post_id)) > -1
                }
                else{
                  return postNodeTlp.indexOf(parseInt(node.comment_id)) > -1
                }
              }).forEach( function (node){
                $scope.s_tag.l3.push(parseInt(node.id));
              });
            }

          }
          else{
            $scope.s_tag.l1 = "all";
            $scope.s_tag.l2 = "all";
            $scope.s_tag.l3 = "all";
          }

          $scope.s_post.l3 = $scope.removeForbiddenNodes($scope.s_post, $scope.s_post.selection_ID);

          if ($scope.s_post.l3.length != 0){
            var userNodeTlp = undefined;
            var tagNodeTlp = undefined;
            $scope.s_post.l3.forEach( function (node_id) {
              var node = $scope.s_post.graph.nodes(node_id);

              if (node.usersAssociateNodeTlp != undefined) {
                var text = node.usersAssociateNodeTlp;
                var tab_few_user = eval("[" + text.substring(1,text.length-1) + "]")
              }
              else{
                var tab_few_user = [];
              }

              if (node.tagsAssociateNodeTlp != undefined) {
                var text = node.tagsAssociateNodeTlp;
                var tab_few_tag = eval("[" + text.substring(1,text.length-1) + "]")
              }
              else{
                var tab_few_tag = [];
              }

              userNodeTlp = $scope.s_post.selectNodesVennfct(userNodeTlp,tab_few_user);
              tagNodeTlp = $scope.s_post.selectNodesVennfct(tagNodeTlp,tab_few_tag);
            });

            //We search the corresponding user nodes
            $scope.s_post.l1 = []
            if (userNodeTlp.length != 0){
              $scope.s_user.graph.nodes().filter( function (node){
                 return userNodeTlp.indexOf(parseInt(node.user_id)) > -1
              }).forEach( function (node){
                $scope.s_post.l1.push(parseInt(node.id));
              });
            }

            //We search the corresponding tag nodes
            $scope.s_post.l2 = [];
            if (tagNodeTlp.length != 0){
              $scope.s_tag.graph.nodes().filter( function (node) {
                 return tagNodeTlp.indexOf(parseInt(node.tag_id)) > -1
              }).forEach( function (node){
                $scope.s_post.l2.push(parseInt(node.id));
              });
            }

          }
          else{
            $scope.s_post.l1 = "all";
            $scope.s_post.l2 = "all";
            $scope.s_post.l3 = "all";
          }



          //We remove the nodes that are not respecting the filters.
          var temp =  $scope.fctIntersect($scope.s_user.l1, $scope.s_tag.l1);
          $scope.s_user.toDisplay_ID = $scope.fctIntersect(temp, $scope.s_post.l1);

          var temp = $scope.fctIntersect($scope.s_user.l2, $scope.s_tag.l2);
          $scope.s_tag.toDisplay_ID = $scope.fctIntersect(temp, $scope.s_post.l2);

          var temp = $scope.fctIntersect($scope.s_user.l3, $scope.s_tag.l3);
          $scope.s_post.toDisplay_ID = $scope.fctIntersect(temp, $scope.s_post.l3);


          //$scope.refreshView($scope.s_user,"fruchtermanReingold");
          $scope.refreshView($scope.s_user,false);
          $scope.refreshView($scope.s_tag,false);
          $scope.refreshView($scope.s_post,"fruchtermanReingold");
          }
        }

         $scope.initializeSigmaInstance = function (sigmaIns, lasso, checkUnique) {
           sigmaIns.filters = []; // We initialize the filters.
           sigmaIns.filtersWhenAll = []; // In case you don't want to display all the graph
           sigmaIns.selection_ID = [];
           sigmaIns.toDisplay_ID = "all";
           sigmaIns.selectNodesVennfct = $scope.fctUnion;
           $scope.sigmaInstances.push(sigmaIns);

           //When the lasso_tag catch new nodes
           lasso.bind('selectedNodes', function (event) {
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

           //We want to now the xmin, xmax, ymin, ymax of the nodes. Needed for the layout algorithm
           var xmin = Number.POSITIVE_INFINITY;
           var xmax = Number.NEGATIVE_INFINITY;
           var ymin = Number.POSITIVE_INFINITY;
           var ymax = Number.NEGATIVE_INFINITY;

           //This is for the user graph. Many nodes are duplicated. We remove them.
           if (checkUnique){
             var nodes_id = [];
             var nodesToAdd = [];

             sigmaIns.graph.nodes().forEach(function (node) {
               node.defaultNodeColor = node.color;
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
               node.defaultNodeColor = node.color;
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

         //s_post is the last to be ready so the other sigma instances are ready too.
         var toUnBind1 = $scope.$watch("s_post", function() {

           if ($scope.s_post != undefined) {

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

             var toUnBind4 = $scope.$watch("s_post.ready", function (){
               if ($scope.s_post.ready == true){
                 $scope.initializeSigmaInstance($scope.s_post, $scope.lasso_post, true); //We want the nodes and the edges to be unique
                 //posts size is too small. We double it.
                 $scope.s_post.graph.nodes().forEach( function (node){
                   if (node.post_id != undefined){
                     node.size = node.size * 3;
                   }
                 });
                 $scope.configFruchtermanReingoldAlgoPost = jQuery.extend(true,{}, $scope.configFruchtermanReingoldAlgo);
                 $scope.configFruchtermanReingoldAlgoPost.iterations = 8000;
                 var listener_post = sigma.layouts.fruchtermanReingold.configure($scope.s_post, $scope.configFruchtermanReingoldAlgoPost);
                 $scope.setLayoutBind(listener_post,$scope.s_post);

                 var displayMainPostAndComment = {}
                 //We take the most recent posts.
                 displayMainPostAndComment.allowedPosts = $scope.s_post.graph.nodes().sort( function compare(node1, node2) {
                   if (node1.post_id == undefined){
                     return 1;
                   }
                   else if (node2.post_id == undefined){
                     return -1;
                   }
                   else{
                     return parseInt(node2.timestamp) - parseInt(node1.timestamp);
                   }
                 })
                .slice(0, 5) // the 5 lasts posts
                .map( function (node){
                   if (node.post_id != undefined){
                     return parseInt(node.post_id);
                   }
                   else{
                     return parseInt(node.comment_id)
                   }
                 });

                 //We search the comments linked to the allowed posts
                 displayMainPostAndComment.allowedComments = []

                 $scope.s_post.graph.edges().forEach(function (edge) {
                   if (displayMainPostAndComment.allowedPosts.indexOf(parseInt($scope.s_post.graph.nodes(edge.source).post_id)) > -1){
                     displayMainPostAndComment.allowedComments.push(parseInt($scope.s_post.graph.nodes(edge.target).comment_id));
                   }
                   else if (displayMainPostAndComment.allowedPosts.indexOf(parseInt($scope.s_post.graph.nodes(edge.target).post_id)) > -1){
                     displayMainPostAndComment.allowedComments.push(parseInt($scope.s_post.graph.nodes(edge.source).comment_id));
                   }
                 });

                 //We remove dupplicated Comments
                 displayMainPostAndComment.allowedComments = [...new Set(displayMainPostAndComment.allowedComments)];
                 displayMainPostAndComment.apply = function (node) {
                   if (node.post_id != undefined){
                     if (this.allowedPosts.indexOf(parseInt(node.post_id)) > -1){
                       return true;
                     }
                     else{
                       return false;
                     }
                   }
                   else{
                     if (this.allowedComments.indexOf(parseInt(node.comment_id)) > -1){
                       return true;
                     }
                     else{
                       return false;
                     }
                   }
                 }

                 $scope.s_post.filtersWhenAll.push(displayMainPostAndComment);

                 $scope.refreshView($scope.s_post,"fruchtermanReingold");

                 toUnBind4();
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

         //Jquery handle post sliders
         $( "#node-label-post-intensity-slider" ).slider({
             min: 0,
             max: $scope.nodePostelThresholdMax-1,
             value: $scope.nodePostelThresholdMax-$scope.nodePostelThreshold ,
             slide: function( event, ui ) {
                 $scope.nodePostelThreshold = $scope.nodePostelThresholdMax-ui.value;
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



         /*** Graphes ***/


         $scope.drawUserGraph = function (suggestions) {
             $scope.usersGraphSigmaDetangler = [];
             $scope.drawUserGraphPromise = $scope.userGraphRessource.get();
             $scope.drawUserGraphPromise.$promise.then(function (result) {
                 $scope.usersGraphSigmaDetangler = result;
                 //$scope.s_user.defaultNodeColor = $scope.usersGraphSigmaDetangler.nodes[0].color
             });
         };



         $scope.drawTagGraph = function (result) {
             $scope.tagsGraphSigmaDetangler = [];
             $scope.drawTagGraphPromise = $scope.tagGraphRessource.get();
             $scope.drawTagGraphPromise.$promise.then(function (result) {
                 $scope.tagsGraphSigmaDetangler = result;
                  //$scope.s_tag.defaultNodeColor = $scope.tagsGraphSigmaDetangler.nodes[0].color
             });
         };

         $scope.drawCommentAndPostGraph = function (result) {
             $scope.postGraphSigmaDetangler = [];
             $scope.drawPostGraphPromise = $scope.postGraphRessource.get();
             $scope.drawPostGraphPromise.$promise.then(function (result) {
                 $scope.postGraphSigmaDetangler = result;
                 //$scope.s_post.defaultNodeColor = $scope.postGraphSigmaDetangler.nodes[0].color
             });
         };

         $scope.generateTagGraph = function () {
             var createGraph = $resource(config.apiUrl + 'generateTagFullGraph/' + $scope.filter_occurence_tag_min + "/" + $scope.selected.start.getTime() + "/" + $scope.selected.end.getTime()+"/0");
             var createGraphPromise = createGraph.get();
             createGraphPromise.$promise.then(function (result) {
                 $scope.drawTagGraph();
             });
         };

         $scope.generateUserGraph = function () {
             var createGraph = $resource(config.apiUrl + 'generateUserGraph');
             var createGraphPromise = createGraph.get();
             createGraphPromise.$promise.then(function (result) {
                 $scope.drawUserGraph();
             });
         };

         $scope.generateCommentAndPostGraph = function () {
             var createGraph = $resource(config.apiUrl + 'generateCommentAndPostGraph');
             //var createGraph = $resource(config.apiUrl + 'generateFullGraph');
             var createGraphPromise = createGraph.get();
             createGraphPromise.$promise.then(function (result) {
                 $scope.drawCommentAndPostGraph();
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

         $scope.clearPostInteractor = function() {
             document.getElementById("interactorPostNavigate").className="btn btn-default";
             document.getElementById("interactorPostDragNode").className="btn btn-default";
             document.getElementById("interactorPostLasso").className="btn btn-default";
             document.getElementById("interactorPostInfo").className="btn btn-default";
             document.getElementById("interactorPostDescriptionLabel").innerHTML = "";
         }

         $scope.setInteractorPostNavigate = function () {
             $scope.clearPostInteractor();
             $scope.postinteractor="navigate";
             document.getElementById("interactorPostNavigate").className="btn btn-primary";
             document.getElementById("interactorPostDescriptionLabel").innerHTML = $("#interactorPostNavigate").attr("data-title");
         }


         $scope.setInteractorPostDragNode = function () {
             $scope.clearPostInteractor();
             $scope.postinteractor="dragNode";
             document.getElementById("interactorPostDragNode").className="btn btn-primary";
             document.getElementById("interactorPostDescriptionLabel").innerHTML = $("#interactorPostDragNode").attr("data-title");
         }

         $scope.setInteractorPostLasso = function () {
             $scope.clearPostInteractor();
             $scope.postinteractor="lasso";
             document.getElementById("interactorPostLasso").className="btn btn-primary";
             document.getElementById("interactorPostDescriptionLabel").innerHTML = $("#interactorPostLasso").attr("data-title");
         }

         $scope.setInteractorPostInfo = function () {
             $scope.clearPostInteractor();
             $scope.postinteractor="information";
             document.getElementById("interactorPostInfo").className="btn btn-primary";
             document.getElementById("interactorPostDescriptionLabel").innerHTML = $("#interactorTagInfo").attr("data-title");
         }

         $scope.clearPostVennInteractor = function() {
             document.getElementById("interactorPostUnion").className="btn btn-default";
             document.getElementById("interactorPostIntersect").className="btn btn-default";
         }

         $scope.setInteractorPostUnion = function () {
             $scope.clearPostVennInteractor();
             $scope.s_post.selectNodesVennfct = $scope.fctUnion;
             document.getElementById("interactorPostUnion").className="btn btn-primary";
             $scope.searchWhatToDisplay();
         }

         $scope.setInteractorPostIntersect = function () {
             $scope.clearPostVennInteractor();
             $scope.s_post.selectNodesVennfct = $scope.fctIntersect;
             document.getElementById("interactorPostIntersect").className="btn btn-primary";
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
                             console.log(e.data.node)
                             $scope.elementType = "user";
                             $scope.elementId = e.data.node.user_id
                             $scope.openInfoPanel($scope.elementType, $scope.elementId);
                         }
                         else if (e.data.node.post_id != undefined && (e.data.captor.ctrlKey || $scope.postinteractor == "information")) {
                           console.log(e.data.node)
                             $scope.elementType = "post";
                             $scope.elementId = e.data.node.post_id;
                             $scope.openInfoPanel($scope.elementType, $scope.elementId);
                         }
                         else if (e.data.node.comment_id != undefined && (e.data.captor.ctrlKey || $scope.postinteractor == "information")) {
                             console.log(e.data.node)
                             $scope.elementType = "comment";
                             $scope.elementId = e.data.node.comment_id;
                             $scope.openInfoPanel($scope.elementType, $scope.elementId);
                         }
                         else if (e.data.node.tag_id != undefined && (e.data.captor.ctrlKey || $scope.taginteractor == "information")) {
                             console.log(e.data.node)
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
