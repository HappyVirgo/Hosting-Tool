import React from 'react';

import { waitFor, render, screen, fireEvent } from '@testing-library/react';
import {UserContext} from "../admin/providers/UserProvider"
import AddAirbnbAccount from "../admin/components/AddAirbnbAccount";


describe('AddAirbnbAccount', () => {

    afterEach(() => {
        jest.clearAllMocks();
    })

    describe('Initial load', () => {

        it('Renders as a form', () => {
            renderAddAirbnbAccount(emptyAddAirbnbAccountProps());
            expect(screen.getByRole('form')).toBeInTheDocument();
        })

        it('Shows error message if no username', async () => {
            renderAddAirbnbAccount(emptyAddAirbnbAccountProps());

            fireEvent.click(screen.getByText('Add Account'))

            await waitFor(() => {
                expect(screen.queryByText("Please enter your Airbnb username.")).toBeInTheDocument();
            });
        })

        it('Shows error message if invalid email', async () => {
            renderAddAirbnbAccount(emptyAddAirbnbAccountProps());

            fireEvent.change(screen.getByLabelText('Airbnb Email'), {target: {value: "invalidemail"}});

            fireEvent.click(screen.getByText('Add Account'))

            await waitFor(() => {
                expect(screen.queryByText("Please enter a valid email address.")).toBeInTheDocument();
            });
        })

        it('Shows error message if no password', async () => {
            renderAddAirbnbAccount(emptyAddAirbnbAccountProps());

            fireEvent.change(screen.getByLabelText('Airbnb Email'), {target: {value: "username@gmail.com"}});

            fireEvent.click(screen.getByText('Add Account'))

            await waitFor(() => {
                expect(screen.queryByText("Please enter your Airbnb password.")).toBeInTheDocument();
            });
        })

        it('Shows no error messages if user provided valid login data', async () => {
            renderAddAirbnbAccount(emptyAddAirbnbAccountProps());

            fireEvent.change(screen.getByLabelText('Airbnb Email'), {target: {value: "username@gmail.com"}});
            fireEvent.change(screen.getByLabelText('Airbnb Password'), {target: {value: "password"}});

            fireEvent.click(screen.getByText('Add Account'))

            await waitFor(() => {
                expect(screen.queryByText("Please enter your Airbnb username.")).not.toBeInTheDocument();
                expect(screen.queryByText("Please enter a valid email address.")).not.toBeInTheDocument();
                expect(screen.queryByText("Please enter your Airbnb password.")).not.toBeInTheDocument();
            });
        })

        it('Hides the modal on successful login', async () => {
            let onHideFunction = jest.fn();
            let props = {
                onHide: onHideFunction,
                hideCloseButtons: false,
                credentials: {
                    airbnbUsername: "",
                    airbnbPassword: "",
                    recaptchaToken: ""}
            }
            renderAddAirbnbAccount(props);

            jest.spyOn(window, 'fetch')
            window.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({success: true}),
            });

            fireEvent.change(screen.getByLabelText('Airbnb Email'), {target: {value: "username@gmail.com"}});
            fireEvent.change(screen.getByLabelText('Airbnb Password'), {target: {value: "password"}});

            fireEvent.click(screen.getByText('Add Account'))

            await waitFor(() => {
                expect(window.fetch).toHaveBeenCalledTimes(1);
                expect(onHideFunction.mock.calls.length).toBe(1);
            });
        })

        it('Adds error on unauthorized login attempt', async () => {
            renderAddAirbnbAccount(emptyAddAirbnbAccountProps());

            jest.spyOn(window, 'fetch')
            window.fetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                json: async () => ({error: "test error message."}),
            });

            fireEvent.change(screen.getByLabelText('Airbnb Email'), {target: {value: "username@gmail.com"}});
            fireEvent.change(screen.getByLabelText('Airbnb Password'), {target: {value: "password"}});

            fireEvent.click(screen.getByText('Add Account'))

            await waitFor(() => {
                expect(screen.queryByText("test error message.")).toBeInTheDocument();
            });
        })

        it('Adds default error on generic failed login attempt', async () => {
            renderAddAirbnbAccount(emptyAddAirbnbAccountProps());

            jest.spyOn(window, 'fetch')
            window.fetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                json: async () => ({error: [1, 2]}),
            });

            fireEvent.change(screen.getByLabelText('Airbnb Email'), {target: {value: "username@gmail.com"}});
            fireEvent.change(screen.getByLabelText('Airbnb Password'), {target: {value: "password"}});

            fireEvent.click(screen.getByText('Add Account'))

            await waitFor(() => {
                expect(screen.getByText(/.*Sometimes Airbnb requires that you confirm your account a few times.*/)).toBeInTheDocument();
            });
        })

        it('Facebook/Google login prompts to reset password', async () => {
            renderAddAirbnbAccount(emptyAddAirbnbAccountProps());

            jest.spyOn(window, 'fetch')
            window.fetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                json: async () => ({error: {account_type: "test account type"}}),
            });

            fireEvent.change(screen.getByLabelText('Airbnb Email'), {target: {value: "username@gmail.com"}});
            fireEvent.change(screen.getByLabelText('Airbnb Password'), {target: {value: "password"}});

            expect(screen.queryAllByText("create a password").length).toBe(1);

            fireEvent.click(screen.getByText('Add Account'))

            await waitFor(() => {
                expect(screen.queryAllByText("create a password").length).toBe(2);
            });
        })

    })

    describe('User has logged into Airbnb account', () => {

        describe('Captcha verification', () => {

            beforeEach(async () => {
                setUpVerificationMethods("captcha");
            })

            it('displays only the relevant text', async () => {

                expect(screen.queryByText(/.*Airbnb wants to confirm that you are a real person and not a robot.*/)).toBeInTheDocument();
                expect(screen.queryByText(/.*Airbnb is temporarily not allowing third party tools to authenticate.*/)).not.toBeInTheDocument();
                expect(screen.queryByText(/.*Host Tools lost connection with Airbnb.*/)).not.toBeInTheDocument();
                expect(screen.queryByText(/.*Please choose from one of the options below.*/)).not.toBeInTheDocument();

            })

            it('hides Next button if captcha is not clicked', async () => {

                expect(screen.queryByText("Next")).not.toBeInTheDocument();

            })

            it('shows Next button if captcha is clicked', async () => {

                fireEvent.click(screen.getByText('Confirm Your Account'))
                expect(screen.queryByText("Next")).toBeInTheDocument();

            })

            it('calls the verification endpoint with the correct data', async () => {

                fireEvent.click(screen.getByText('Confirm Your Account'))

                jest.spyOn(window, 'fetch')
                window.fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({}),
                });

                fireEvent.click(screen.getByText('Next'))

                await waitFor(() => {
                    expect(window.fetch).toHaveBeenCalledTimes(2)
                    expect(window.fetch).toHaveBeenCalledWith(
                        '/verifyAirbnbAccount',
                        expect.objectContaining({
                            method: 'POST',
                            body: JSON.stringify({id: "1", captchaComplete: true}),
                        }),
                    )
                });

            })

            it('hides modal on successful captcha verification', async () => {

                // next

            })

        })

        describe('Contact Airbnb verification', () => {

            beforeEach(async () => {
                setUpVerificationMethods("contact_airbnb");
            })

            it('displays only the relevant text', async () => {

                expect(screen.queryByText(/.*Airbnb wants to confirm that you are a real person and not a robot.*/)).not.toBeInTheDocument();
                expect(screen.queryByText(/.*Airbnb is temporarily not allowing third party tools to authenticate.*/)).toBeInTheDocument();
                expect(screen.queryByText(/.*Host Tools lost connection with Airbnb.*/)).not.toBeInTheDocument();
                expect(screen.queryByText(/.*Please choose from one of the options below.*/)).not.toBeInTheDocument();

            })

        })

        describe('Verification blocked', () => {

            beforeEach(async () => {
                setUpVerificationMethods("hard_block_message");
            })

            it('displays only the relevant text', async () => {

                expect(screen.queryByText(/.*Airbnb wants to confirm that you are a real person and not a robot.*/)).not.toBeInTheDocument();
                expect(screen.queryByText(/.*Airbnb is temporarily not allowing third party tools to authenticate.*/)).not.toBeInTheDocument();
                expect(screen.queryByText(/.*Host Tools lost connection with Airbnb.*/)).toBeInTheDocument();
                expect(screen.queryByText(/.*Please choose from one of the options below.*/)).not.toBeInTheDocument();

            })

        })

        describe('Choose your verification', () => {

            beforeEach(async () => {
                setUpVerificationMethods("test_verification_method");
            })

            it('displays only the relevant text', async () => {

                expect(screen.queryByText(/.*Airbnb wants to confirm that you are a real person and not a robot.*/)).not.toBeInTheDocument();
                expect(screen.queryByText(/.*Airbnb is temporarily not allowing third party tools to authenticate.*/)).not.toBeInTheDocument();
                expect(screen.queryByText(/.*Host Tools lost connection with Airbnb.*/)).not.toBeInTheDocument();
                expect(screen.queryByText(/.*Please choose from one of the options below.*/)).toBeInTheDocument();

            })

        })

    })

    // describe('Account verification code sent', () => {
    //
    //     it('Renders as a form', () => {
    //         renderAddAirbnbAccount(emptyAddAirbnbAccountProps());
    //         expect(screen.getByRole('form')).toBeInTheDocument();
    //     })
    //
    // })

})

async function setUpVerificationMethods (verificationMethod, props) {
    window.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({error: {id: "1", verificationMethods: [{type: verificationMethod}]}}),
    });

    renderAddAirbnbAccount(props ? props : emptyAddAirbnbAccountProps());

    fireEvent.change(screen.getByLabelText('Airbnb Email'), {target: {value: "username@gmail.com"}});
    fireEvent.change(screen.getByLabelText('Airbnb Password'), {target: {value: "password"}});

    fireEvent.click(screen.getByText('Add Account'))

    await waitFor(() => {
        expect(screen.getByText("Verify Airbnb Account")).toBeInTheDocument();
    });
}

function emptyAddAirbnbAccountProps() {
    return {
        onHide: () => {},
        hideCloseButtons: false,
        credentials: {
            airbnbUsername: "",
            airbnbPassword: "",
            recaptchaToken: ""}
    }
}

function renderAddAirbnbAccount(props) {
    let mockValue = jest.mock("../admin/providers/UserProvider", () => ({
        __esModule: true,
        default: React.createContext()
    }));

    return render(
        <UserContext.Provider value={mockValue}>
            <AddAirbnbAccount
                onHide={props.onHide}
                hideCloseButtons={props.hideCloseButtons}
                credentials={props.credentials}
            />
        </UserContext.Provider>
    );
}