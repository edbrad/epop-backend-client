/* jshint -W117, -W030 */
describe('statements routes', function () {
    describe('state', function () {
        var view = 'app/statements/statements.html';

        beforeEach(function() {
            module('app.statements', bard.fakeToastr);
            bard.inject('$httpBackend', '$location', '$rootScope', '$state', '$templateCache');
        });

        beforeEach(function() {
            $templateCache.put(view, '');
        });

        it('should map state admin to url /statements ', function() {
            expect($state.href('statements', {})).to.equal('/statements');
        });

        it('should map /statements route to Mail Owners View template', function () {
            expect($state.get('statements').templateUrl).to.equal(view);
        });

        it('of mailAwners should work with $state.go', function () {
            $state.go('statements');
            $rootScope.$apply();
            expect($state.is('statements'));
        });
    });
});
