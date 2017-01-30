'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MultiViewCtrl
 * @description
 * # MultiViewCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('MultiViewCtrl', function ($scope, $resource, config, $uibModal, $rootScope, $location, $timeout, $compile) {

        /**** Init ****/
        $scope.infoPanelParent = "infoPanelParent";
        // wait rootScope to be ready
        $rootScope.$watch('ready', function(newVal) {
            if(newVal) {
                $scope.layoutChoice = $rootScope.layout[12];
                $scope.layoutChoiceComments = $rootScope.layout[12];
                $scope.userGraphRessource = $resource(config.apiUrl + 'draw/usersToUsers/' + $scope.layoutChoice);
                $scope.drawUserGraph(true);
                $scope.drawPostGraph();
            }
        });

        /*** user view ***/
        $scope.usersGraphSigma = [];

        $scope.drawUserGraph = function (suggestions) {
            $scope.drawGraphPromise = $scope.userGraphRessource.get();
            $scope.drawGraphPromise.$promise.then(function (result) {
                $scope.usersGraphSigma = result;
                $scope.nodes = $scope.usersGraphSigma.nodes;
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

        /*** post view ***/
        // todo generate this view from the other ( via edges values )
        $scope.commentsGraphSigma = [];
        $scope.drawPostGraph = function () {
            var url = config.apiUrl + 'draw/commentAndPost/'+ $scope.layoutChoiceComments;
            $resource(url).get().$promise.then(function (result) {
                $scope.commentsGraphSigma = result;
            });
        };

        /*** Event Catcher Users ***/
        $scope.comments = [];
        $scope.click = false;
        $scope.locate = [];

        $scope.eventCatcherUsers = function (e) {
            switch(e.type) {
                case 'clickNode':
                    $scope.elementType = "user";
                    $scope.elementId = e.data.node.user_id;
                    $scope.openInfoPanel($scope.elementType, $scope.elementId);
                    break;
                case 'clickEdges':
                    if(e.data.edge != undefined && e.data.edge.length > 0) {
                        $scope.comments = [];
                        $scope.locate = [];
                        angular.forEach(e.data.edge, function(value) {
                            var comment = {from_id : "", from_subject: "", to_id: "", to_subject: ""};
                            if (value.post_id != undefined) {
                                comment.from_id = value.comment_id;
                                $scope.locate.push(parseInt(value.comment_id));
                                comment.from_subject = value.comment_title;
                                comment.to_type = "post";
                                comment.to_id = value.post_id;
                                $scope.locate.push(parseInt(value.post_id));
                                comment.to_subject = value.post_title;
                            }
                            else {
                                comment.from_id = value.comment_id1;
                                $scope.locate.push(parseInt(value.comment_id1));
                                comment.from_subject = value.comment1_title;
                                comment.to_type = "comment";
                                comment.to_id = value.comment_id2;
                                $scope.locate.push(parseInt(value.comment_id2));
                                comment.to_subject = value.comment2_title;
                            }
                            $scope.comments.push(comment);
                        });
                        $scope.$apply();
                    }
                    break;
            }
        };

        /********* Info Panel ***************/
        $scope.openInfoPanel = function(elementType, elementId) {
            var mod = document.createElement("panel-info");
            mod.setAttribute("type", elementType);
            mod.setAttribute("id", elementId);
            mod.setAttribute("parent", $scope.infoPanelParent);
            jQuery("#"+ $scope.infoPanelParent).append(mod);
            $compile(mod)($scope);
        };

        /********* Modal  ***************/
        $scope.openModal = function (type, id) {
            $scope.elementType = type;
            $scope.elementId = id;

            var modalInstance = $uibModal.open({
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
                        return $scope; // Give to the modal the parent scope reference
                    }
                }
            });

            // Catch return, reopen a new modal ?
            modalInstance.result.then(function (res) {
                if(res != undefined) {
                    res = res.split(':');
                    $scope.openModal(res[0], res[1]);
                }
            });
        };

        /*** Event catcher comment ***/
        $scope.eventCatcherComment = function (e) {
            switch(e.type) {
                case 'clickNode':
                    if(e.data.node.user_id != undefined) {
                        $scope.elementType = "user";
                        $scope.elementId = e.data.node.user_id;
                    }
                    else if(e.data.node.post_id != undefined) {
                        $scope.elementType = "post";
                        $scope.elementId = e.data.node.post_id;
                    }
                    else if(e.data.node.comment_id != undefined) {
                        $scope.elementType = "comment";
                        $scope.elementId = e.data.node.comment_id;
                    }
                    $scope.openInfoPanel($scope.elementType, $scope.elementId);
                    break;
            }
        };

        /*** search catcher *****/
        $rootScope.$watch('search', function(newVal) {
            if(newVal != undefined) {
                if( newVal.uid != undefined) {
                    var type = "uid";
                    var id = newVal.uid;
                }
                else if( newVal.pid != undefined) {
                    var type = "pid";
                    var id = newVal.pid;
                }
                else if( newVal.cid != undefined) {
                    var type = "cid";
                    var id = newVal.cid;
                }
                var params = {"max_size": 5};
                var CreateGraph = $resource(config.apiUrl + 'doi/usersToUsers/'+ type +'/'+ id, params);
                var creategraph = CreateGraph.get();
                creategraph.$promise.then(function (result) {
                    $scope.userGraphRessource = $resource(config.apiUrl + 'draw/'+ result.gid +'/'+ $scope.layoutChoice);
                    // todo do not wait but cancel the promise
                    if (!$scope.drawGraphPromise.$resolved)
                        $timeout(function() { $scope.drawUserGraph(); }, 1000);
                    else
                        $scope.drawUserGraph(false);
                });
            }
        });

        /***** On exit *****/
        $scope.$on("$destroy", function(){
            $rootScope.resetSuggestions(false, true, true);
            //todo stop all pending request
            // remove watchers in rootScope
            angular.forEach($rootScope.$$watchers, function(watcher, key) {
                if(watcher.exp === 'search' || watcher.exp === 'ready')
                    $rootScope.$$watchers.splice(key, 1);
            });
        });
    });
