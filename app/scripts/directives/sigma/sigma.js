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
            maxNodeSize: '=?',
            defaultEdgeHoverColor: '@?',
            defaultLabelColor: '@?',
            edgeColor: '@?'
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
            if (scope.defaultEdgeHoverColor == undefined)
                scope.defaultEdgeHoverColor = '#000';
            if (scope.defaultLabelColor == undefined)
                scope.defaultLabelColor = '#000';
            if (scope.edgeColor == undefined)
                scope.edgeColor = 'rgba(204,204,204,.5)';
            var neighbourhood = {}
            neighbourhood.adjacentNodes = [];
            neighbourhood.adjacentEdges = [];
            neighbourhood.nodesColour = [];
            neighbourhood.edgesColour = [];

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
                    enableEdgeHovering: true,
                    edgeHoverColor: 'default',
                    defaultEdgeHoverColor: scope.defaultEdgeHoverColor,
                    edgeHoverSizeRatio: 2,
                    edgeHoverExtremities: true,
                    maxNodeSize: scope.maxNodeSize,
                    defaultLabelColor: scope.defaultLabelColor,
                    defaultEdgeLabelColor:  scope.defaultLabelColor
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
                    return (((Number(n[scope.metricFilter]) >= Number(metricMin) && Number(n[scope.metricFilter]) <= Number(metricMax)) || Number(n[scope.metricFilter]) == Number(scope.metricNeutralFilter)));
                  }, 'nodeFilter')
                  .apply();
                filter
                  .undo('edgeFilter')
                  .edgesBy(function(e) {
                    return (Number(e[scope.metricFilter]) >= Number(metricMin) && Number(e[scope.metricFilter]) <= Number(metricMax));
                  }, 'edgeFilter')
                  .apply();
            }



            /**** Watch for update ****/
            scope.$watch('metricMinFilter', function(newVal) {
                metricFilter(newVal, scope.metricMaxFilter);
            });
            scope.$watch('metricMaxFilter', function(newVal) {
                metricFilter(scope.metricMinFilter, newVal);
            });
            scope.$watch('graph', function() {
                if (scope.graph != undefined && scope.graph != []){
                  s.graph.clear();
                  s.graph.read(scope.graph);
                  var edges = s.graph.edges(); 

                  //Using for loop
                  for (var i = 0; i < edges.length; i += 1){
                      edges[i].color = edges[i].color.substring(0, edges[i].color.length - 1) + ',.5)';
                  }
                  
                  if (s.graph.nodes().length > 0){
                    s.ready = true;
                  }
                  s.refresh();
                }

            });
            scope.$watch('edgeLabels', function(newVal) {
                if (scope.graph != undefined && scope.graph != []){
                  s.graph.clear();
                  s.settings({
                      drawEdgeLabels: newVal
                  });
                  s.graph.read(scope.graph);
                  s.refresh();
                }
            });
            scope.$watch('threshold', function(newVal) {
                if (scope.graph != undefined && scope.graph != []){
                  //s.graph.clear();
                  s.settings({
                      labelThreshold: newVal
                  });
                  //s.graph.read(scope.graph);
                  s.refresh();
                }
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
              'strokeStyle': 'white',
              'lineWidth': 2,
              'fillWhileDrawing': true,
              'fillStyle': 'rgba(41, 41, 41, 0.2)',
              'cursor': 'crosshair'
            });
            scope.lasso = lasso;

            scope.$watch('interactor', function() {
                if (scope.interactor == 'dragNode') {
                    //console.log('change to drag')
                    // Instanciate the ActiveState plugin:
                    var activeState = sigma.plugins.activeState(s);

                    if (s.dragListener){
                      delete s.dragListener;
                    }
                    s.dragListener = sigma.plugins.dragNodes(s, s.renderers[0], activeState);
                } else if (s.dragActive == true){
                    s.dragListener.unbindAll();
                }

                if (scope.interactor == 'lasso') {
                  lasso.activate();
                }
                else{
                  lasso.deactivate();
                }

                //console.log('change to lasso');
                if (scope.interactor == 'navigate') {
                    //console.log('change to navigate')
                }
                //var dragListener = new sigma.plugins.dragNodes(sigmaInstance, renderer, activeState);


            });

            element.on('$destroy', function() {
                s.graph.clear();
            });
        }
    };
});
