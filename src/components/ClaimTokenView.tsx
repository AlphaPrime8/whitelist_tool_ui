import {
    ConnectionProvider,
    useWallet,
    useConnection,
    WalletProvider,
    useAnchorWallet
} from '@solana/wallet-adapter-react';
import React, {Dispatch, FC, ReactNode, SetStateAction, useMemo, useState} from 'react';
import {getToken, getProjectInfo} from "../utils/program_utils";
import * as anchor from "@project-serum/anchor";
import {PublicKey} from "@solana/web3.js";

interface CreateMultisigViewProps {
    setAppState: (val: number) => void,
    setProjectConfig: (val: any) => void,
    projectConfig: any,
    projectId: string,
}

let initialized = false;

export const ClaimTokenView: FC<CreateMultisigViewProps> = (props) => {

    const {connection} = useConnection();
    const wallet = useAnchorWallet();
    const {sendTransaction} = useWallet();


    // Get token balance
    if (!initialized) {
        getProjectInfo(connection, wallet as anchor.Wallet, props.projectId)
            .then((data) => {
                console.log("setInfo to ", data);
                props.setProjectConfig(data);
            })
            .catch((err) => {
                props.setProjectConfig({
                    balance: "got err" + err,
                    project: PublicKey.default,
                    wl_mint_address: PublicKey.default,
                })

            });
        initialized = true;
    }

    function getTokenSync(){
        console.log("attempting to get token with params: ");
        console.log("wl_mint_address: ", props.projectConfig.wl_mint_address.toString());
        console.log("project: ", props.projectConfig.wl_mint_address.toString());
        getToken(connection, wallet as anchor.Wallet, sendTransaction, props.projectConfig.wl_mint_address, props.projectConfig.project)
            .then((val)=>{
                console.log("got token successfully...")
                console.log(val)
                props.setAppState(2);
            })
            .catch((err)=>alert("got error" + err));
    }

    let create_new_html = (

        <div>
            <header>
                Project Whitelist
            </header>

            <section>
                <div className="Card1">
                    <p>
                        Project ID: <br/>{props.projectId}
                    </p>
                    <p>
                        # Tokens Available: <br/>{props.projectConfig.balance}
                    </p>
                    <br/>
                    <button onClick={()=> getTokenSync()}>
                        Claim Token
                    </button>
                    <br/>
                    <p>
                        WL Token Mint Deposit Address: <br/>{props.projectConfig.wl_deposit_address + ""}
                    </p>
                </div>
            </section>
        </div>
    );

    return create_new_html;

};

