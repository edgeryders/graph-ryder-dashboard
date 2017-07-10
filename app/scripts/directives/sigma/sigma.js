/**
 * Created by nferon on 06/06/16.
 */
angular.module('sbAdminApp')
.directive('sigmaJs', function() {
    return {
        restrict: 'E',
        template: '<div style="width: 100%;height: 100%;"></div>',
        scope: {
            graph: '=',
            width: '@',
            height: '@',
            id: '@',
            threshold: '@?',
            edgeLabels: '=?',
            locate: '=?',
            timeFilter: '=?',
            eventCatcher: '&',
            metricFilter: '@?',
            metricMinFilter: '@?',
            metricMaxFilter: '@?',
            metricNEutralFilter: '@?',
            interactor: '@?',
            cleanRefresh: '@?',
            s: '=?',
            lasso: '=?',
            maxNodeSize: '=?'
        },
        link: function (scope, element) {
            // default values
            if (scope.threshold == undefined)
                scope.threshold = 4;
            if (scope.edgeLabels == undefined)
                scope.edgeLabels = false;
            if (scope.metricMinFilter == undefined)
                scope.metricMinFilter = 1;
            if (scope.metricMaxFilter == undefined)
                scope.metricMaxFilter = 10;
            if (scope.metricNeutralFilter == undefined)
                scope.metricNeutralFilter = -1;
            var neighbourhood = {}
            neighbourhood.adjacentNodes = [];
            neighbourhood.adjacentEdges = [];
            neighbourhood.nodesColour = [];
            neighbourhood.edgesColour = [];
            //scope.user_node_selected = [];
            scope.showNodeFilter = [];

            // Create sigma instance
            var s = new sigma({
                renderer: {
                    container: element[0].firstChild,
                    type: 'canvas'
                },
                settings: {
                    labelThreshold: scope.threshold,
                    labelSize: "fixed",
                    drawEdgeLabels: scope.edgeLabels,
                    minArrowSize: 5,
                    enableEdgeHovering: false,
                    edgeHoverColor: '#000',
                    defaultEdgeHoverColor: '#000',
                    edgeHoverSizeRatio: 2,
                    edgeHoverExtremities: true,
                    maxNodeSize: scope.maxNodeSize
                }
            });
            scope.s = s;
            /**** Plugins ****/

            /**** Interactions ****/
            function arrayUnique(array) {
              var a = array.concat();
              for(var i=0; i<a.length; ++i) {
                for(var j=i+1; j<a.length; ++j) {
                  if(a[i] === a[j])
                    a.splice(j--, 1);
                }
              }
              return a;
            };
            function resetHighlight() {
              for(var tmp=0; tmp<neighbourhood.adjacentNodes.length ; tmp++) {
                neighbourhood.adjacentNodes[tmp].size/=2;
                neighbourhood.adjacentNodes[tmp].color = neighbourhood.nodesColour[tmp];
              }
              for(var tmp=0; tmp<neighbourhood.adjacentEdges.length ; tmp++) {
                neighbourhood.adjacentEdges[tmp].size/=2;
                neighbourhood.adjacentEdges[tmp].color=neighbourhood.edgesColour[tmp];
              }
              neighbourhood.adjacentNodes = [];
              neighbourhood.adjacentEdges = [];
            }
            function highlightNeighbourhood(e) {
              var node = e.data.node;
              resetHighlight();

              // Get adjacent nodes:
              neighbourhood.adjacentNodes = neighbourhood.adjacentNodes.concat(s.graph.adjacentNodes(node.id));

              // Add hovered nodes to the array and remove duplicates:
              neighbourhood.adjacentNodes = arrayUnique(neighbourhood.adjacentNodes.concat(node));

              // Get adjacent edges:
              neighbourhood.adjacentEdges = neighbourhood.adjacentEdges.concat(s.graph.adjacentEdges(node.id));

              // Remove duplicates:
              neighbourhood.adjacentEdges = arrayUnique(neighbourhood.adjacentEdges);
              for(var tmp=0; tmp<neighbourhood.adjacentNodes.length ; tmp++) {
                neighbourhood.adjacentNodes[tmp].size*=2;
                neighbourhood.nodesColour[tmp] = neighbourhood.adjacentNodes[tmp].color;
                neighbourhood.adjacentNodes[tmp].color="rgb(0,0,200)"
              }
              for(var tmp=0; tmp<neighbourhood.adjacentEdges.length ; tmp++) {
                neighbourhood.adjacentEdges[tmp].size*=2;
                neighbourhood.edgesColour[tmp] = neighbourhood.adjacentEdges[tmp].color;
                neighbourhood.adjacentEdges[tmp].color="rgb(0,0,200)"
              }
              s.refresh();
            }

            /**** Bind Event ****/
            s.bind('clickEdges hovers', function(e) {
                scope.eventCatcher()(e);
            });

            s.bind('clickNode', function(e) {
                scope.eventCatcher()(e);
                if (scope.interactor == "neighbourhood") {
                    highlightNeighbourhood(e);
                }
            });

            /**** locate ****/
            if (scope.locate != undefined) {
                var conf = {
                    animation: {
                        node: {duration: 800},
                        edge: {duration: 800},
                        center: {duration: 300}
                    },
                    focusOut: false,
                    zoomDef: 1
                };
                var locate = sigma.plugins.locate(s, conf);

                locate.setPadding({
                    top: 10,
                    bottom: 10,
                    right: 10,
                    left: 10
                });
                scope.$watch('locate', function (newVal, oldVal) {
                    if(newVal.toString() != oldVal.toString()) {
                        var nodes = s.graph.nodes().filter(function (n) {
                            if (n.user_id != undefined && scope.locate.indexOf(parseInt(n.user_id)) != -1) {
                                //todo use color code
                                n.color = "rgb(51,122,183)";
                                return true;
                            }
                            else if (n.post_id != undefined && scope.locate.indexOf(parseInt(n.post_id)) != -1) {
                                n.color = "rgb(92,184,92)";
                                return true;
                            }
                            else if (n.comment_id != undefined && scope.locate.indexOf(parseInt(n.comment_id)) != -1) {
                                n.color = "rgb(240, 173, 78)";
                                return true;
                            }
                            else
                                n.color = "rgb(128, 128, 128)";
                        }).map(function (n) {
                            return n.id;
                        });
                        if (nodes.length > 0)
                            locate.nodes(nodes);
                        else
                            locate.center(conf.zoomDef);
                    }
                });
            }

            /**** Filter ****/
            scope.$watch('timeFilter', function () {
                s.graph.nodes().filter(function (n) {
                    if (n.user_id != undefined && scope.timeFilter.start <= n.timestamp && scope.timeFilter.end >= n.timestamp) {
                        //todo use color code
                        n.color = "rgb(51,122,183)";
                        return true;
                    }
                    else if (n.post_id != undefined && scope.timeFilter.start <= n.timestamp && scope.timeFilter.end >= n.timestamp) {
                        //todo use color code
                        n.color = "rgb(92,184,92)";
                        return true;
                    }
                    else if  (n.comment_id != undefined && scope.timeFilter.start <= n.timestamp && scope.timeFilter.end >= n.timestamp) {
                        n.color = "rgb(240, 173, 78)";
                        return true;
                    }
                    else
                        n.color = "rgb(128, 128, 128)";
                }).map(function (n) {
                    return n.id;
                });
                s.refresh();
            });

            var filter = new sigma.plugins.filter(s);
            var metricFilter = function(metricMin, metricMax) {
                filter
                  .undo('nodeFilter')
                  .nodesBy(function(n) {
                    return (((n.couldAppear != undefined) ? n.couldAppear : true) && ((Number(n[scope.metricFilter]) >= Number(metricMin) && Number(n[scope.metricFilter]) <= Number(metricMax)) || Number(n[scope.metricFilter]) == Number(scope.metricNeutralFilter)));
                  }, 'nodeFilter')
                  .apply();
                filter
                  .undo('edgeFilter')
                  .edgesBy(function(e) {
                    return (Number(e[scope.metricFilter]) >= Number(metricMin) && Number(e[scope.metricFilter]) <= Number(metricMax));
                  }, 'edgeFilter')
                  .apply();
            }


            /*
            var second_filter = new sigma.plugins.filter(s);
            var nodeFilter = function(tab_node) {
              filter
                .undo('nodeShowFilter')
                .nodesBy(function(n) {
                  if (tab_node.indexOf(n.user_id) > -1){
                    console.log(n);
                    console.log(tab_node);
                  }
                  //return (scope.showNodeFilter.indexOf(n.user_id) > -1);
                  return true;
                }, 'nodeShowFilter')
                .apply();
              }
            */



            //var filter_node = new sigma.plugins.filter(s);
            //filter_node.nodesBy(function(n) {

            /**** Watch for update ****/

            scope.$watch('metricMinFilter', function(newVal) {
                metricFilter(newVal, scope.metricMaxFilter);
            });
            scope.$watch('metricMaxFilter', function(newVal) {
                metricFilter(scope.metricMinFilter, newVal);
            });
            scope.$watch('graph', function() {
                s.graph.clear();
                s.graph.read(scope.graph);
                if (s.graph.nodes().length > 0){
                  s.ready = true;
                }                
                s.refresh();
            });
            scope.$watch('edgeLabels', function(newVal) {
                s.graph.clear();
                s.settings({
                    drawEdgeLabels: newVal
                });
                s.graph.read(scope.graph);
                s.refresh();
            });
            scope.$watch('threshold', function(newVal) {
                s.graph.clear();
                s.settings({
                    labelThreshold: newVal
                });
                s.graph.read(scope.graph);
                s.refresh();
            });
            scope.$watch('width', function() {
                element.children().css("width",scope.width);
                s.refresh();
                window.dispatchEvent(new Event('resize')); //hack so that it will be shown instantly
            });
            scope.$watch('height', function() {
                element.children().css("height",scope.height);
                s.refresh();
                window.dispatchEvent(new Event('resize'));//hack so that it will be shown instantly
            });
            scope.$watch('cleanRefresh', function() {
                resetHighlight();
                s.refresh();
            });


            var lasso = new sigma.plugins.lasso(s, s.renderers[0], {
              'strokeStyle': 'black',
              'lineWidth': 2,
              'fillWhileDrawing': true,
              'fillStyle': 'rgba(41, 41, 41, 0.2)',
              'cursor': 'crosshair'
            });
            scope.lasso = lasso;


            scope.$watch('interactor', function() {
                if (scope.interactor == 'dragNode') {
                    console.log('change to drag')
                    // Instanciate the ActiveState plugin:
                    var activeState = sigma.plugins.activeState(s);

                    // Initialize the dragNodes plugin:
                    var dragListener = sigma.plugins.dragNodes(s, s.renderers[0], activeState);
                } else {
                    sigma.plugins.killDragNodes(s);
                }

                if (scope.interactor == 'nodeSelection') {
                    console.log('change to node selection')
                    var activeState = sigma.plugins.activeState(s);
                    // Initialize the Select plugin:
                    var selectListener = sigma.plugins.select(s, activeState);
                    //var keyboard = sigma.plugins.keyboard(s, s.renderers[0]);
                    //selectListener.bindKeyboard(keyboard);

                    //activeState.bind('activeNodes', _.debounce(function(event) {
                    //    console.log('active nodes:', activeState.nodes());}, 250)
                    //);
                    activeState.bind('activeNodes', function(event) {
                        console.log('active nodes:', activeState.nodes());
                        console.log(scope.defaultNodeSize);
                        s.graph.nodes().forEach(function (node) {
                          node.color = scope.defaultNodeColor;
                          node.size = scope.defaultNodeSize;
                        });
                        activeState.nodes().forEach(function (node) {
                          node.color = 'rgb(42, 187, 155)';
                          node.size *= 7;
                        });
                    });
                }
                else{
                  sigma.plugins.killActiveState();
                  sigma.plugins.killSelect(s);
                }

                if (scope.interactor == 'lasso') {
                  console.log('change to lasso');
                  lasso.activate();
                }
                else{
                  lasso.deactivate();
                }

                if (scope.interactor == 'navigate') {
                    console.log('change to navigate')
                }
                //var dragListener = new sigma.plugins.dragNodes(sigmaInstance, renderer, activeState);


            });
            scope.$watch('highlightNodes', function (newVal, oldVal) {


            });
            element.on('$destroy', function() {
                s.graph.clear();
            });
        }
    };
});
