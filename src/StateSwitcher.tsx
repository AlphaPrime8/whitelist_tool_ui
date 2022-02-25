import {ConnectionProvider, useWallet, useConnection, WalletProvider} from '@solana/wallet-adapter-react';
import React, {Dispatch, FC, ReactNode, SetStateAction, useMemo, useState} from 'react';
import {CreateProjectView} from "./components/CreateProjectView";
import {CreateSuccessView} from "./components/CreateSuccessView";
import {ClaimTokenView} from "./components/ClaimTokenView";
import {ClaimSuccessView} from "./components/ClaimSuccessView";
import {PleaseConnectView} from "./components/PleaseConnectView";


export const StateSwitcher: FC = () => {

    // parse params
    const queryParams = new URLSearchParams(window.location.search);
    const project_id = queryParams.get('project_id');
    const [appState, setAppState] = useState(0);
    const [projectConfig, setProjectConfig] = useState(
        {
            balance: "loading...",
            wl_deposit_address: "loading..."
        });
    const { publicKey } = useWallet();

    if (!publicKey) {
        return (<PleaseConnectView setAppState={setAppState}/>);
    }
    else if (project_id && (appState !== 2)) {
        return ( <ClaimTokenView setAppState={setAppState} projectId={project_id} setProjectConfig={setProjectConfig} projectConfig={projectConfig}/>);
    }
    else if (appState === 0) {
        return (<CreateProjectView setAppState={setAppState} setProjectConfig={setProjectConfig}/>);
    }
    else if (appState === 1) {
        return ( <CreateSuccessView setAppState={setAppState} projectConfig={projectConfig}/>);
    }
    else if (appState === 2) {
        return ( <ClaimSuccessView someVal={"any"}/>);
    }
    else {
        return (
            <div>Unknown state</div>
        );
    };

};

