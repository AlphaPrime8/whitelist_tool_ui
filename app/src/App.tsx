import {ConnectionProvider, useWallet, useConnection, WalletProvider} from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, {createContext, FC, ReactNode, useContext, useMemo, useState} from 'react';
import {Context} from "./components/Context";
import {StateSwitcher} from "./StateSwitcher";

export const App: FC = () => {
    return (
        <Context>
            <WalletMultiButton/>
            <StateSwitcher/>
        </Context>
    );
};




