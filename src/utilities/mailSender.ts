"use strict";

import {spawn} from 'node:child_process';

let inFlight=0;

export const sendMailIsolated=
(
	from: string,
	to: string,
	subject: string,
	text: string,
	logger: {error: (msg: string)=>void}
): void=>
{
	const safeLog=(msg: string): void=>
	{
		try
		{
			if(logger)
			{
				logger.error(msg);
			}
		}
		catch(error){}
	};

	try
	{
		const host=process.env.RESOURCE_REQUEST_MAIL_SSH_HOST;
		const user=process.env.RESOURCE_REQUEST_MAIL_SSH_USER;
		const keyPath=process.env.RESOURCE_REQUEST_MAIL_SSH_KEY_PATH;

		if(!host || !user || !keyPath || !to)
		{
			return;
		}

		const maxInFlight=Number(process.env.RESOURCE_REQUEST_MAIL_MAX_INFLIGHT||4)
		if(inFlight>=maxInFlight)
		{
			return;
		}
		++inFlight;

		let finished=false;
		const finish=(): void=>
		{
			if(finished)
			{
				return;
			}
			finished=true;
			if(inFlight>0)
			{
				--inFlight;
			}
		}

		const msg=
			`From: ${from}\n`+
			`To: ${to}\n`+
			`Subject: ${subject}\n`+
			`MIME-Version: 1.0\n`+
			`Content-Type: text/html; charset=UTF-8\n`+
			`\n`+
			`${text}\n`;

		const p=spawn
		(
			'ssh',
			[
				'-T',
				'-o', 'PasswordAuthentication=no',
				'-o', 'KbdInteractiveAuthentication=no',
				'-o', 'StrictHostKeyChecking=no',
				'-o', 'BatchMode=yes',
				'-o', 'IdentitiesOnly=yes',
				'-o', 'ConnectionAttempts=2',
				'-o', 'ConnectTimeout=4',
				'-o', 'ServerAliveInterval=4',
				'-o', 'ServerAliveCountMax=2',
				'-i', keyPath,
				`${user}@${host}`
			],
			{stdio: ['pipe', 'ignore', 'ignore']}
		);

		const killTimer=setTimeout
		(
			()=>
			{
				try
				{
					p.kill('SIGKILL');
				}
				catch(error){}
			},
			8000
		);
		killTimer.unref();

		p.on('error', (err)=>
		{
			try
			{
				clearTimeout(killTimer);
			}
			catch(error){}
			finish();
			safeLog(`Mailing list ${to} notification spawn failed: ${String(err)}`)
		});

		p.on('exit', (code, signal)=>
		{
			try
			{
				clearTimeout(killTimer);
			}
			catch(error){}
			finish();
			if(code===0)
			{
				return;
			}
			safeLog(`Mailing list ${to} notification failed: code=${code} signal=${signal||'none'}`)
		});

		p.stdin.on('error', ()=>{});

		try
		{
			p.stdin.end(msg)
		}
		catch(err)
		{
			try
			{
				clearTimeout(killTimer);
			}
			catch(error){}
			finish();
			safeLog(`Mailing list ${to} notification write failed: ${String(err)}`);
			try
			{
				p.kill('SIGKILL');
			}
			catch(error){}
			return;
		}
		p.unref();
	}
	catch(err)
	{
		safeLog(`Mailing list ${to} notification setup failed: ${String(err)}`)
	}
}
