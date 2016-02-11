/* jshint -W117, -W030 */
describe('StatementsController', function() {
    var controller;

    beforeEach(function() {
        bard.appModule('app.statements');
        bard.inject('$controller', '$log', '$rootScope');
    });

    beforeEach(function () {
        controller = $controller('statementsController');
        $rootScope.$apply();
    });

    bard.verifyNoOutstandingHttpRequests();

    describe('Mail Owner controller', function() {
        it('should be created successfully', function () {
            expect(controller).to.be.defined;
        });

        describe('after activate', function() {
            it('should have title of Mail Owners', function() {
                expect(controller.title).to.equal('Mail Owners');
            });

            it('should have logged "Activated"', function() {
                expect($log.info.logs).to.match(/Activated/);
            });
        });
    });
});
