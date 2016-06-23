/**
 * Created by nferon on 21/06/16.
 */
angular.module('sbAdminApp')
    .controller('ModalInstanceCtrl', function ($scope, $resource, $uibModalInstance, config, scopeParent) {

        console.log($uibModalInstance);
        $scope.elementId = scopeParent.elementId;
        $scope.elementType = scopeParent.elementType;

        switch($scope.elementType) {
            case "uid":
                var User = $resource(config.apiUrl + "user/" + $scope.elementId);
                var user = User.query();
                user.$promise.then(function (result) {
                    $scope.user = result.pop();
                    console.log("done");
                });
                break;
            case "pid":
                var Post = $resource(config.apiUrl + "post/" + $scope.elementId);
                var post = Post.query();
                post.$promise.then(function (result) {
                    $scope.post = result.pop();
                });
                break;
            case "cid":
                var Comment = $resource(config.apiUrl + "comment/" + $scope.elementId);
                var comment = Comment.query();
                comment.$promise.then(function (result) {
                    $scope.comment = result.pop();
                });
                break;
            default:
                console.log("error with modalView directive unknow type");
        }
        $scope.cancel = function () {
            $uibModalInstance.close();
        };
});