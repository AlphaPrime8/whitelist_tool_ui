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
                        Enter Whitelist Token Address
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

