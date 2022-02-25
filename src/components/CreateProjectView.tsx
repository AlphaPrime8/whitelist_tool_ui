import {
    ConnectionProvider,
    useWallet,
    useConnection,
    WalletProvider,
    WalletContextState,
    useAnchorWallet
} from '@solana/wallet-adapter-react';
import React, {Dispatch, FC, ReactNode, SetStateAction, useMemo} from 'react';
import * as anchor from "@project-serum/anchor";
import {createProject, getToken} from "../utils/program_utils";
import {PublicKey} from "@solana/web3.js";

function isAlphaNumeric(str: string) {
    var code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
};

interface CreateMultisigViewProps {
    setAppState: (val: number) => void,
    setProjectConfig: (val: any) => void,
}


export const CreateProjectView: FC<CreateMultisigViewProps> = (props) => {

    const {connection} = useConnection();
    const wallet = useAnchorWallet();
    const {sendTransaction} = useWallet();

    // TODO implement nameString and mintString validation
    let nameString = '';
    let mintString = '';

    function setProjectName(name: string){
        nameString = name;
    }

    function setMintAddress(name: string){
        mintString = name;
    }

    function createProjectSync(){

        if (nameString.length > 32){
            alert("Project name must be less name 32 characters or less.")
            return;
        }
        else if (!isAlphaNumeric(nameString)){
            alert("Project name must be alphanumeric with no spaces.")
            return;
        }

        // validate mint address?
        try{
            new PublicKey(mintString);
        }
        catch (e) {
            alert("invalid mint address: " + mintString);
        }


        createProject(connection, wallet as anchor.Wallet, nameString, mintString)
            .then((val)=>{
                console.log(val);
                props.setProjectConfig(val);
                props.setAppState(1);
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
                        Project Name
                    </p>
                    <form>
                        <input type="text" name="testfield" onChange={(e)=> setProjectName(e.target.value)}/>
                    </form>
                    <p>
                        Enter Whitelist Token Mint Address
                    </p>
                    <form>
                        <input type="text" name="testfield" onChange={(e)=> setMintAddress(e.target.value)}/>
                    </form>

                    <br/>
                    <button onClick={()=> {
                        createProjectSync();
                    }}>
                        Create Whitelist Project
                    </button>
                </div>
            </section>
        </div>
    );

    return create_new_html;

};

