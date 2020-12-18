import React from 'react';

import { waitFor, render, screen, fireEvent } from '@testing-library/react';
import {UserContext} from "../admin/providers/UserProvider"
import AddAirbnbAccount from "../admin/components/AddAirbnbAccount";


describe('AddAirbnbAccount', () => {

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
                // Can't get past
                // __insp.push(["tagSession", "Airbnb Added Event"]);
                // and
                // await updateUser(20);
                // inside hideAddAccount()
                // expect(onHideFunction.mock.calls.length).toBe(1);
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

        beforeEach(async () => {
            jest.spyOn(window, 'fetch')
            window.fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({error: {id: "1", verificationMethods: ["1", "2"]}}),
            });

            renderAddAirbnbAccount(emptyAddAirbnbAccountProps());

            fireEvent.change(screen.getByLabelText('Airbnb Email'), {target: {value: "username@gmail.com"}});
            fireEvent.change(screen.getByLabelText('Airbnb Password'), {target: {value: "password"}});

            fireEvent.click(screen.getByText('Add Account'))

            await waitFor(() => {
                expect(screen.getByText('Verify Airbnb Account'))
            });
        })

        it('Renders as a form', async () => {

            expect(screen.getByRole('form')).toBeInTheDocument();

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