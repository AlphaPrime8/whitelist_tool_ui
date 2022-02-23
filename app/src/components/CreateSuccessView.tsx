import {ConnectionProvider, useWallet, useConnection, WalletProvider} from '@solana/wallet-adapter-react';
import React, {Dispatch, FC, ReactNode, SetStateAction, useMemo} from 'react';

interface CreateMultisigViewProps {
    setAppState: (val: number) => void,
    projectConfig: any,
}

export const CreateSuccessView: FC<CreateMultisigViewProps> = (props) => {

    // TODO set in config
    const URL = "http://localhost:1234?project_id=";

    let create_new_html = (

        <div>
            <header>
                Project Whitelist
            </header>

            <section>
                <div className="Card1">
                    <p>
                        Project Name: <br/>{props.projectConfig.project_id}
                    </p>
                    <p>
                        Whitelist Token Deposit Address: <br/>{props.projectConfig.wl_token_deposit_address}
                    </p>
                    <br/>
                    <p>
                        Whitelist URL: <br/>{URL + props.projectConfig.project_id}
                    </p>
                </div>
            </section>
        </div>
    );

    return create_new_html;

};

