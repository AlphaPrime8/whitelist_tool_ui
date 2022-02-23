import {ConnectionProvider, useWallet, useConnection, WalletProvider} from '@solana/wallet-adapter-react';
import React, {Dispatch, FC, ReactNode, SetStateAction, useMemo} from 'react';

interface CreateMultisigViewProps {
    someVal: any,
}

export const ClaimSuccessView: FC<CreateMultisigViewProps> = (props) => {

    let create_new_html = (

        <div>
            <header>
                Project Whitelist
            </header>

            <section>
                <div className="Card1">
                    <p>
                        Success!
                    </p>
                </div>
            </section>
        </div>
    );

    return create_new_html;

};

