/**
 * Created by nferon on 06/06/16.
 */
angular.module('sbAdminApp')
.directive('sigmaJs', function() {
    //over-engineered random id, so that multiple instances can be put on a single page
    return {
        restrict: 'E',
        template: '<div style="width: 100%;height: 100%;"></div>',
        scope: {
            //@ reads the attribute value, = provides two-way binding, & works with functions
            graph: '=',
            locate: '=?',
            width: '@',
            height: '@',
            id: '@',
            edgeLabels: '=?',
            threshold: '@?',
            eventCatcher: '&',
            timeFilter: '=?'
        },
        link: function (scope, element, attrs) {
            // default values
            if (scope.threshold == undefined)
                scope.threshold = 4;
            if (scope.edgeLabels == undefined)
                scope.edgeLabels = false;

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
                    edgeHoverColor: '#000',
                    defaultEdgeHoverColor: '#000',
                    edgeHoverSizeRatio: 2,
                    edgeHoverExtremities: true
                }
            });

            /**** Bind Event ****/
            s.bind('clickNode clickEdges hovers', function(e) {
                scope.eventCatcher()(e);
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
                            if (n.uid != undefined && scope.locate.indexOf(parseInt(n.uid)) != -1) {
                                //todo use color code
                                n.color = "rgb(0, 0, 255)";
                                return true;
                            }
                            else if (n.pid != undefined && scope.locate.indexOf(parseInt(n.pid)) != -1) {
                                //todo use color code
                                n.color = "rgb(0, 255, 0)";
                                return true;
                            }
                            else if (n.cid != undefined && scope.locate.indexOf(parseInt(n.cid)) != -1) {
                                n.color = "rgb(255, 100, 0)";
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

            /**** timeFilter ****/
            scope.$watch('timeFilter', function () {
                var nodes = s.graph.nodes().filter(function (n) {
                    if (n.uid != undefined && scope.timeFilter.start <= n.timestamp && scope.timeFilter.end >= n.timestamp) {
                        //todo use color code
                        n.color = "rgb(0, 0, 255)";
                        return true;
                    }
                    else if (n.pid != undefined && scope.timeFilter.start <= n.timestamp && scope.timeFilter.end >= n.timestamp) {
                        //todo use color code
                        n.color = "rgb(0, 255, 0)";
                        return true;
                    }
                    else if  (n.cid != undefined && scope.timeFilter.start <= n.timestamp && scope.timeFilter.end >= n.timestamp) {
                        n.color = "rgb(255, 100, 0)";
                        return true;
                    }
                    else
                        n.color = "rgb(128, 128, 128)";
                }).map(function (n) {
                    return n.id;
                });
                s.refresh();
            });

            /**** Watch for update ****/
            scope.$watch('graph', function(newVal,oldVal) {
                s.graph.clear();
                s.graph.read(scope.graph);
                s.refresh();
            });
            scope.$watch('edgeLabels', function(newVal,oldVal) {
                s.graph.clear();
                s.settings({
                    drawEdgeLabels: newVal
                });
                s.graph.read(scope.graph);
                s.refresh();
            });
            scope.$watch('width', function(newVal,oldVal) {
                element.children().css("width",scope.width);
                s.refresh();
                window.dispatchEvent(new Event('resize')); //hack so that it will be shown instantly
            });
            scope.$watch('height', function(newVal,oldVal) {
                element.children().css("height",scope.height);
                s.refresh();
                window.dispatchEvent(new Event('resize'));//hack so that it will be shown instantly
            });
            element.on('$destroy', function() {
                s.graph.clear();
            });
        }
    };
});