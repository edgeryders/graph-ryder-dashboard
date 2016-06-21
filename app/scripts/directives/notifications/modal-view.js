/**
 * Created by nferon on 20/06/16.
 */
angular.module('sbAdminApp')
    .directive('modalView', function() {
        return {
            templateUrl:'scripts/directives/notifications/modal-view.html',
            scope: {
                elementType: '@',
                elementId: '@'
            },
            restrict: 'E',
            controller: ['$scope', '$resource', function($scope, $resource) {
                switch($scope.elementType) {
                    case "uid":
                        break;
                    case "pid":
                        var Post = $resource("http://nferon.ovh:5000/post/" + $scope.elementId);
                        var post = Post.query();
                        post.$promise.then(function (result) {
                            $scope.post = result.pop();
                        });
                        break;
                    case "cid":
                        var Comment = $resource("http://nferon.ovh:5000/comment/" + $scope.elementId);
                        var comment = Comment.query();
                        comment.$promise.then(function (result) {
                            $scope.comment = result.pop();
                        });
                        break;
                    default:
                        console.log("error with modalView directive unknow type");
                }
            }]
        }
    });