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
            width: '@',
            height: '@',
            id: '@',
            edgeLabels: '='
        },
        link: function (scope, element, attrs) {
            // Let's first initialize sigma:
            var s = new sigma({
                renderer: {
                    container: element[0].firstChild,
                    type: 'canvas'
                },
                settings: {
                    labelThreshold: 6,
                    labelSize: "fixed",
                    drawEdgeLabels: scope.edgeLabels,
                    minArrowSize: 5
                }
            });

            scope.$watch('graph', function(newVal,oldVal) {
                s.graph.clear();
                s.graph.read(scope.graph);
                s.refresh();
            });

            scope.$watch('edgeLabels', function(newVal,oldVal) {

                console.log("refresh");
                s.graph.clear();
                s.settings({
                    drawEdgeLabels: newVal
                });
                s.graph.read(scope.graph);
                s.refresh();
            });

            scope.$watch('width', function(newVal,oldVal) {
                console.log("graph width: "+scope.width);
                element.children().css("width",scope.width);
                s.refresh();
                window.dispatchEvent(new Event('resize')); //hack so that it will be shown instantly
            });
            scope.$watch('height', function(newVal,oldVal) {
                console.log("graph height: "+scope.height);
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