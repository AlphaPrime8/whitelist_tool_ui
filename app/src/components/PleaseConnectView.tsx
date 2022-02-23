import {ConnectionProvider, useWallet, useConnection, WalletProvider} from '@solana/wallet-adapter-react';
import React, {Dispatch, FC, ReactNode, SetStateAction, useMemo} from 'react';

interface CreateMultisigViewProps {
    setAppState: (val: number) => void,
}

export const PleaseConnectView: FC<CreateMultisigViewProps> = (props) => {

    let create_new_html = (

        <div>
            <header>
                Project Whitelist
            </header>

            <section>
                <div className="Card1">
                    <p>
                        Please Connect Wallet...
                    </p>
                </div>
            </section>
        </div>
    );

    return create_new_html;

};

