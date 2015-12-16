/* jshint -W117, -W030 */
describe('CRIDsController', function() {
    var controller;

    beforeEach(function() {
        bard.appModule('app.CRIDs');
        bard.inject('$controller', '$log', '$rootScope', 'CRID');
    });

    beforeEach(function () {
        controller = $controller('CRIDsController');
        $rootScope.$apply();
    });

    bard.verifyNoOutstandingHttpRequests();

    describe('CRIDs controller', function() {
        it('should be created successfully', function () {
            expect(controller).to.be.defined;
        });

        describe('after activate', function() {
            it('should have title of CRIDs', function() {
                expect(controller.title).to.equal('CRIDs');
            });

            it('should have logged "Activated"', function() {
                expect($log.info.logs).to.match(/Activated/);
            });
        });
    });
});
