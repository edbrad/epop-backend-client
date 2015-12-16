/* jshint -W117, -W030 */
describe('MailerIdsController', function() {
    var controller;

    beforeEach(function() {
        bard.appModule('app.mailerIds');
        bard.inject('$controller', '$log', '$rootScope');
    });

    beforeEach(function () {
        controller = $controller('MailerIdsController');
        $rootScope.$apply();
    });

    bard.verifyNoOutstandingHttpRequests();

    describe('MailerIds controller', function() {
        it('should be created successfully', function () {
            expect(controller).to.be.defined;
        });

        describe('after activate', function() {
            it('should have title of Mailer Ids', function() {
                expect(controller.title).to.equal('Mailer Ids');
            });

            it('should have logged "Activated"', function() {
                expect($log.info.logs).to.match(/Activated/);
            });
        });
    });
});
