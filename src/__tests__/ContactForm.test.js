import React from 'react';

import { render, screen } from '@testing-library/react';
import ContactForm from "../admin/components/ContactForm";

describe('ContactForm', () => {

    it('Renders as a form', () => {
        render(<ContactForm />)
        expect(screen.getByRole('form')).toBeInTheDocument()
    })
})