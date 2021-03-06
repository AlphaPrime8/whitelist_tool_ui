import * as anchor from "@project-serum/anchor";
import {Keypair, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import * as spl_token from "@solana/spl-token";
import {WalletContextState} from "@solana/wallet-adapter-react";
import {PROGRAM_ID} from "../Config";
import {getMint} from "@solana/spl-token";

// consts
const PROJECT_RECORD_SEED = "project_record_seed";
const WL_TOKEN_MINT_PDA_SEED = "wl_token_mint_pda_seed";
const FEE_RX_ADDRESS = new PublicKey("GdaZged4o8Szocgn18XvZCmfmshBPQw1HrWbnbhowa14");
const REDEEMER_PROJECT_RECORD_SEED = "redeemer_project_record_seed";

async function initProgram(connection: anchor.web3.Connection, wallet: anchor.Wallet) {
    const programId = new anchor.web3.PublicKey(PROGRAM_ID);
    let opts = anchor.Provider.defaultOptions();
    let provider = new anchor.Provider(connection, wallet as anchor.Wallet, opts);
    let idl = await anchor.Program.fetchIdl(programId, provider);
    console.log("got idl: ", idl)
    let program = new anchor.Program(idl as anchor.Idl, programId, provider);
    return program;
}

async function createProject(connection: anchor.web3.Connection, wallet: anchor.Wallet, project_name: string, mint_address: string) {

    console.log("creating projects...");
    const MASTER_RECORD_PDA_SEED = "master_record_pda_seed";
    const AUTH_PDA_SEED = "auth_pda_seed";
    const WL_TOKEN_MINT = new PublicKey(mint_address);

    // init random creation values
    let project = Keypair.generate();
    console.log("initializing program...");
    let program = await initProgram(connection, wallet);
    console.log("initialized program: ", program);

    // test param generation
    // const SAMPLE_WL_TOKEN_MINT = new PublicKey("GUJb6Tuk3NF6XFVZ4JaB1M2RAoR8CoFpkzrgKAXWC93V");
    // let random_int = parseInt((Math.random()*10000).toString()).toString();
    // let project_name = "proj-" + random_int;

    console.log("got program:");
    console.log(program);

    let [master_record_pda] = await PublicKey.findProgramAddress(
        [Buffer.from(MASTER_RECORD_PDA_SEED)],
        program.programId
    );
    let [project_record_pda] = await PublicKey.findProgramAddress(
        [Buffer.from(project_name), Buffer.from(PROJECT_RECORD_SEED)],
        program.programId
    );
    let [auth_pda] = await PublicKey.findProgramAddress(
        [project.publicKey.toBuffer(), Buffer.from(AUTH_PDA_SEED)],
        program.programId
    );
    let [pool_wl_token] = await PublicKey.findProgramAddress(
        [project.publicKey.toBuffer(), Buffer.from(WL_TOKEN_MINT_PDA_SEED)],
        program.programId
    );

    // check if project name already in use
    let projInfo;
    try {
        projInfo = await program.account.projectRecord.fetch(project_record_pda);
        projInfo = false;
    }
    catch (e) {
        // good, project record not already in use.
        projInfo = true;
    }
    if (!projInfo){
        alert("Project name already in use.")
        throw "Please use a different project name";
    }

    console.log("generating project named: ", project_name);
    console.log("project pubkey: ", project.publicKey.toString());
    console.log("project wl pool address: ", pool_wl_token.toString());

    let result = await program.rpc.createProject(
        project_name,
        {
            accounts: {
                signer: program.provider.wallet.publicKey,
                project: project.publicKey,
                projectRecordPda: project_record_pda,
                authPda: auth_pda,
                poolWlToken: pool_wl_token,
                wlTokenMint: WL_TOKEN_MINT,
                feeReceiverAddress: FEE_RX_ADDRESS,
                masterRecordPda: master_record_pda,
                systemProgram: SystemProgram.programId,
                tokenProgram: spl_token.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            signers: [project],
        }
    );
    console.log("got resulting sig for createProject(): ", result);

    return {
        wl_token_deposit_address: pool_wl_token.toString(),
        project_id: project_name,
        tx_sig: result,
    };
}

async function getToken(
    connection: anchor.web3.Connection,
    wallet: anchor.Wallet,
    sendTransaction: WalletContextState["sendTransaction"],
    wl_token_mint: PublicKey,
    project: PublicKey,
) {

    // spl-token mint GUJb6Tuk3NF6XFVZ4JaB1M2RAoR8CoFpkzrgKAXWC93V 3 EH6kDKpsA3xh8jbqmqH87ohtpkLjri3a4Ws61ASz8a85

    const MASTER_RECORD_PDA_SEED = "master_record_pda_seed";
    const AUTH_PDA_SEED = "auth_pda_seed";
    // const SAMPLE_WL_TOKEN_MINT = new PublicKey("GUJb6Tuk3NF6XFVZ4JaB1M2RAoR8CoFpkzrgKAXWC93V");
    // let project = new PublicKey("H2ZmJaF7d5GuFXDQYzEHbUwrhhKVRM8rkKjAjtvrHQgT")

    // init random creation values
    let program = await initProgram(connection, wallet);

    console.log("got program:");
    console.log(program);

    let [master_record_pda] = await PublicKey.findProgramAddress(
        [Buffer.from(MASTER_RECORD_PDA_SEED)],
        program.programId
    );
    let [auth_pda] = await PublicKey.findProgramAddress(
        [project.toBuffer(), Buffer.from(AUTH_PDA_SEED)],
        program.programId
    );
    let [pool_wl_token] = await PublicKey.findProgramAddress(
        [project.toBuffer(), Buffer.from(WL_TOKEN_MINT_PDA_SEED)],
        program.programId
    );
    let [redeemer_project_record] = await PublicKey.findProgramAddress(
        [project.toBuffer(), program.provider.wallet.publicKey.toBuffer(), Buffer.from(REDEEMER_PROJECT_RECORD_SEED)],
        program.programId
    );

    // init tx
    let transaction = new Transaction();

    // get or create ata
    let receiverAta;
    try {
        // @ts-ignore
        const receiverAtaInfo = await spl_token.getOrCreateAssociatedTokenAccount(connection, program.provider.wallet, wl_token_mint, program.provider.wallet.publicKey);
        receiverAta = receiverAtaInfo.address;
        console.log("got receiverATA: ", receiverAta.toString());
    }
    catch (e) {
        // add create ata ix to tx
        receiverAta = await spl_token.getAssociatedTokenAddress(wl_token_mint, program.provider.wallet.publicKey);
        const create_ata_ix = spl_token.createAssociatedTokenAccountInstruction(
            program.provider.wallet.publicKey,
            receiverAta,
            program.provider.wallet.publicKey,
            wl_token_mint,
        );
        transaction.add(create_ata_ix);
        console.log("added create account ix for ata: ", receiverAta.toString());
    }


    console.log("project pubkey: ", project.toString());
    console.log("project wl pool address: ", pool_wl_token.toString());

    let get_token_ix = await program.instruction.getToken(
        {
            accounts: {
                signer: program.provider.wallet.publicKey,
                project: project,
                redeemerProjectRecord: redeemer_project_record,
                poolWlToken: pool_wl_token,
                wlTokenMint: wl_token_mint,
                wlTokenRxAta: receiverAta,
                authPda: auth_pda,
                masterRecordPda: master_record_pda,
                feeReceiverAddress: FEE_RX_ADDRESS,
                systemProgram: SystemProgram.programId,
                tokenProgram: spl_token.TOKEN_PROGRAM_ID,
            },
        }
    );
    transaction.add(get_token_ix);

    console.log("attempting to send tx");
    const signature = await sendTransaction(transaction, connection);
    console.log("sent tx got sig: ", signature);
    await connection.confirmTransaction(signature, "processed");
    console.log("confirmed")

    return signature;
}

async function getProjectInfo(connection: anchor.web3.Connection, wallet: anchor.Wallet, project_name: string) {

    // get project address from id
    let program = await initProgram(connection, wallet);

    //TODO check if valid project_id
    let [project_record_pda] = await PublicKey.findProgramAddress(
        [Buffer.from(project_name), Buffer.from(PROJECT_RECORD_SEED)],
        program.programId
    );

    try {
        let acctInfo = await program.account.projectRecord.fetch(project_record_pda);
        let projectAddress = acctInfo.projectAddress;
        console.log(acctInfo);
        console.log("got project address: ", projectAddress.toString());

        // TODO check if user already clamed
        let [redeemer_project_record] = await PublicKey.findProgramAddress(
            [projectAddress.toBuffer(), program.provider.wallet.publicKey.toBuffer(), Buffer.from(REDEEMER_PROJECT_RECORD_SEED)],
            program.programId
        );
        try {
            acctInfo = await program.account.authAccount.fetch(redeemer_project_record);
            alert("You have already claimed a WL token for this project.")
            return {
                balance: "you have already claimed a WL token for this project.",
                project: PublicKey.default,
                wl_mint_address: PublicKey.default,
                wl_deposit_address: "N/A"
            };
        }
        catch (e) {
            // good, user remeemer record not found
        }

        // get token pool balance and mint
        let [pool_wl_token] = await PublicKey.findProgramAddress(
            [projectAddress.toBuffer(), Buffer.from(WL_TOKEN_MINT_PDA_SEED)],
            program.programId
        );

        // get token pool
        let wlAcctInfo = await spl_token.getAccount(connection, pool_wl_token);

        // TODO load mint info - > decimals -> math
        let mint_address = wlAcctInfo.mint;
        let mintInfo = await getMint(connection, mint_address);
        let mint_decimals = mintInfo.decimals;
        let balance = Number(wlAcctInfo.amount);
        let balance_decimals = balance / Math.pow(10, mint_decimals);
        let amountStr = balance_decimals + "";
        console.log("got mint decimals: ", mint_decimals);
        console.log("got wl AcctInfo: ", wlAcctInfo);
        console.log("got amount str: ", amountStr);
        return {
            balance: amountStr,
            project: projectAddress,
            wl_mint_address: wlAcctInfo.mint,
            wl_deposit_address: pool_wl_token.toString(),
        };
    }
    catch (e) {
        alert(e)
        // project does not exist
        return {
            balance: "this project does not exist...",
            project: PublicKey.default,
            wl_mint_address: PublicKey.default,
            wl_deposit_address: "N/A"
        };
    }
}

export {createProject, getToken, getProjectInfo};
