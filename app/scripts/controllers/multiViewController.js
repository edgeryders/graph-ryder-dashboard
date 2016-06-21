'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MultiViewCtrl
 * @description
 * # MultiViewCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('MultiViewCtrl', function ($scope, $resource, config) {

        var layout = "FM^3 (OGDF)";

        $scope.userel  = true;
        $scope.postel = false;

        $scope.usersGraphSigma = [];
        var field = "uid";
        var value = "34";

        // todo call users route
        var CreateGraph = $resource(config.apiUrl + 'users/doi/'+ field +'/'+ value);
        var creategraph = CreateGraph.query();
        creategraph.$promise.then(function (result) {
            var graph_id = result.pop();
            var graph_id_string = "";
            angular.forEach(graph_id, function(value, key) {
                graph_id_string += value;
            });
            var drawGraph = $resource(config.apiUrl + 'draw/'+ graph_id_string +'/'+ layout);
            var drawgraph = drawGraph.query();
            drawgraph.$promise.then(function (result) {
                $scope.usersGraphSigma = result.pop();
            });
        });

        $scope.comments = [];
        $scope.click = false;
        
        /*** Event Catcher Users ***/
        $scope.eventCatcherUsers = function (e) {
            switch(e.type) {
                case 'clickNode':
                    console.log(e);
                    //document.getElementById("button-34").click();
                    $scope.elementType = "uid";
                    $scope.elementId = e.data.node.uid;
                    $uibModal.open(modalInstance);
                    break;
                case 'hovers':
                    if($scope.click)
                        break;
                    else
                        e.data.edge = e.data.current.edges;
                case 'clickEdges':
                    $scope.click = (e.type != "hovers");
                    if(e.data.edge != undefined && e.data.edge.length > 0) {
                        $scope.comments = [];
                        angular.forEach(e.data.edge, function(value, key) {
                            var comment = {from_id : "", from_subject: "", to_id: "", to_subject: ""};
                            if (value.pid != undefined) {
                                comment.from_id = value.cid;
                                comment.from_subject = value.comment_subject;
                                comment.to_type = "pid";
                                comment.to_id = value.pid;
                                comment.to_subject = value.post_title;
                            }
                            else {
                                comment.from_id = value.cid1;
                                comment.from_subject = value.comment1_subject;
                                comment.to_type = "cid";
                                comment.to_id = value.cid2;
                                comment.to_subject = value.comment2_subject;
                            }
                            $scope.comments.push(comment)
                        });
                        $scope.$apply()
                    }
                    break;
            }
        };

        /********* Modal test ***************/
        var modalInstance = {
            animation: true,
            templateUrl: 'views/ui-elements/modal-view.html',
            controller: 'ModalInstanceCtrl',
            buttons: {
                Cancel: function () {
                    $("#modal_dialog").dialog("close");
                }
            },
            resolve: {
                scopeParent: function() {
                    return $scope; //On passe à la fenêtre modal une référence vers le scope parent.
                }
            }
        };

    });
