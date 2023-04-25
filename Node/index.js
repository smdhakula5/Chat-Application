const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const { exit } = require('process');

let user = [];
let msg = [];
let usercnt = 0;

function addUserInArray()
{
	console.log(`here`);
	for(let i=0;i<usercnt;i++)
	{
		for(let j=0;j<usercnt;j++)
		{
			if(i==j) continue;
			msg[i].push({from:`${user[j]}`, to:`${user[i]}`, message:''});
		}
	}
	// for(let i=0;i<usercnt-1;i++)
	// 	msg[usercnt-1].push({from:`${user[i]}`,to:`${username}`,message:''});
}
// Load User ----------------------------------------------------------------------------------------------------------------------------------------------------
{
	let filepath = path.join(__dirname,'public','Users','usersData.txt');
	fs.readFileSync(filepath).toString().split('\n').forEach((data)=>{
		let detail = data.split(' ');
		console.log(detail[0]);
		if(detail[0]!='') 
		{
			user.push(detail[0]);
			usercnt++;
			msg.push([]);
		}
	})
	addUserInArray();
	console.log(user);
	console.log(msg);
}

const server = http.createServer((req,res)=>{
	

		
	// GET METHOD -----------------------------------------------------------------------------------------
	if(req.method=='GET')
	{
		let pathname = url.parse(req.url).pathname;
		let filepath = path.join(__dirname,'public',pathname==='/'?'index.html':pathname);
		// Build File Path
		
		// Extension of the file
		let extname = path.extname(filepath);

		// Initial Content Type
		let contentType = 'text/html';

		// Check Extension Name
		switch(extname)
		{
			case '.js': contentType = 'text/javascript'
					break;
			case '.css': contentType = 'text/css'
					break;
			case '.png': contentType = 'image/png'
					break;
			case '.jpeg': contentType = 'image/jpg'
					break;
			case '.jpg': contentType = 'image/jpg'
					break;
			case '.svg': contentType = 'image/svg+xml'
					break;
		}

		// Read File
		fs.readFile(filepath,(err,content)=>{
			if(err)
			{
				if(err.code=='ENONET')
				{
					fs.readFile(path.join(__dirname,'public','404.html'),(err,content)=>{
						res.writeHead(200,{'Content-Type':'text/html'});
						res.end(content,'utf8');
					})
				}
				else
				{
					// Server Error
					fs.writeFile(path.join(__dirname,'public','tempError.html'),`<html lang="en">
					<head>
						<meta charset="UTF-8">
						<meta http-equiv="X-UA-Compatible" content="IE=edge">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Error</title>
					</head>
					<body>
						<div class="error" style="text-align: center; font-size: 75px; color: grey; margin-top: 15%;">
							Error code ${err.code} Found
						</div>
						
					</body>
					</html>`,()=>{})
					fs.readFile(path.join(__dirname,'public','tempError.html'),(err,content)=>{
						res.writeHead(200,{'Content-type':'text/html'});
						// content.document.querySelector('.error').innerHTML(`Error Code ${err.code}`);
						res.end(content,'utf8');
					})
				}
			}
			else
			{
				//Success
				res.writeHead(200,{'Content-Type':contentType});
				res.end(content,'utf8');
			}
		})
	}


// POST Request -------------------------------------------------------------------------------------------------------------------------------------------------
	else if(req.method=='POST')
	{
		let body = '';
		let body_arr = [];
		let filepath = path.join(__dirname,'public','Users','usersData.txt');
//POST METHODS --------------------------------------------------------------------------------------------------------------------------------------------
		req.on('data',(chunk)=>{body+=chunk;})
		req.on('end',()=>{
			// console.log(body);
			body_arr = body.split(',');
			// console.log(body_arr[0]);
			switch(body_arr[0])
			{
				case 'SendMessage': let arr = splitArr(body);
								// console.log(arr);
								sendMessage(arr);
					break;
				case 'ReceiveMessages': receiveMessage(body_arr[1]);
					break;
				case 'ValidateSignUp': validateSignUp(body_arr);
					break;
				case 'ValidateLogin': validateLogin(body_arr);
					break;
				case 'logoutUser': validateLogout(body_arr[1]);
					break;
			}
			function splitArr(body)
			{
				let flag=0;
				let from = '';
				let to = '';
				let msg = '';
				for(let i=0;i<body.length;i++)
				{
					if(body[i]==',')
					{
						if(flag==3) msg+=body[i];
						else flag++;
						continue;
					}
					if(flag==1)
					{
						from+=body[i];
					}
					else if(flag==2)
					{
						to+=body[i];
					}
					else if(flag==3)
					{
						msg+=body[i];
					}
				}
				let arr = [];
				arr.push('x');
				arr.push(from);
				arr.push(to);
				arr.push(msg);
				return arr;
			}
// Send Messages ----------------------------------------------------------------------------------------------------------------------------
			function addEmptyMessage(idx)
			{
				for(let i=0;i<user.length;i++)
				{
					if(idx!=i)
						msg[idx].push({from:`${user[i]}`,to:`${body_arr[2]}`,message:''})
				}
			}
			

			function sendMessage(body)
			{
				console.log('SEND MESSAGE FUNCTION --------------------------');
				let idx = user.indexOf(body[2]);
				if(idx==-1)
				{
					console.log('User not available');
					res.writeHead(200,{'Content-Type':'text/html'});
					res.end('False');
				}
				else
				{
					console.log(msg[idx].length);
					if(msg[idx].length==0)
						addEmptyMessage(idx);

					// console.log(msg);
					for(let i=0;i<msg[idx].length;i++)
					{
						if(msg[idx][i].from==body[1])
						{
							msg[idx][i].message=body[3];
						}
					}
					console.log(msg);
					res.writeHead(200,{'Content-Type':'text/html'});
					res.end('True');
				}
			}

// Recieve Messages -------------------------------------------------------------------------------------------------------------------
			function concatStrings(arr)
			{
				let str='';
				for(let i=0;i<arr.length;i++)
				{
					str+=`${arr[i].from},`;
					str+=`${arr[i].to},`;
					str+=`${arr[i].message}|`;
				}
				return str;
			}

			function receiveMessage(username)
			{
				console.log('RECEIVE MESSAGE FUNCTION --------------------------');
				let i=user.indexOf(username);
				if(i==-1)
				{
					console.log(`Invalid user asking for Messages`);
					return;
				}
				let str='';
				let str2 = '';
				for(let i=0;i<user.length;i++)
				{
					if(user[i]==username)
					{
						str=concatStrings(msg[i]);
						str2=JSON.stringify(msg[i]);
						break;
					}
				}
				msg[i]=[];
				// console.log(str2);
				res.writeHead(200,{'Content-Type':'text/html'});
				res.end(str2);
			}

// Login ----------------------------------------------------------------------------------------------------------------------
			function validateFileLogin(username,password)
			{
				let flag = 0;
				fs.readFileSync(filepath).toString().split('\n').forEach((data) => {
					let detail = data.split(' ');
					if(detail[0]==username && detail[1]==password)
						flag = 1;
				});
				return flag;
			}

			function validateLogin(body)
			{
				console.log('LOGIN FUNCTION --------------------------');

				if(validateFileLogin(body[1],body[2]))
				{
					res.writeHead(200,{'Content-Type':'text/html'});
					res.end('True');
				}
				else
				{
					res.writeHead(200,{'Content-Type':'text/html'});
					res.end('False');
				}
			}
// Logout ----------------------------------------------------------------------------------------------------------------------
			function validateLogout(username)
			{
				console.log('LOGOUT FUNCTION --------------------------');

				let idx = user.indexOf(username);
				// console.log(msg);
				for(let i=0;i<user.length;i++)
				{
					if(i!=idx)
					{
						msg[idx].push({from:`${user[i]}`,to:`${username}`,message:''});
					}
				}
				console.log(msg);
				res.writeHead(200,{'Content-Type':'text/html'});
				res.end('True');
			}

// Sign Up --------------------------------------------------------------------------------------------------------------------
			function addNewUser(username,password)
			{

				fs.writeFile(filepath,`${username} ${password}\n`,{encoding:'utf-8',flag:'a'},(err)=>
				{
					if(err)
						console.log(err);
					console.log('File Written');
				});
			}

			function validateSignUp(body)
			{
				console.log('SIGN UP FUNCTION --------------------------');

				if(user.indexOf(body[1])!=-1)
				{
					res.writeHead(200,{'Content-Type':'text/html'});
					res.end('False');
				}
				else
				{
					user.push(body[1]);
					msg.push([]);
					usercnt++;
					for(let i=0;i<user.length-1;i++)
						msg[i].push({from:`${body[1]}`, to:`${user[i]}`, message:''});
					for(let i=0;i<user.length-1;i++)
						msg[user.length-1].push({from:`${user[i]}`,to:`${body[1]}`,message:''});
					addNewUser(body[1],body[2]);
					console.log(user);
					console.log(msg);
					res.writeHead(200,{'Content-Type':'text/html'});
					res.end('True');
				}
			}
		})
	}
});

const PORT = 5000;
server.listen(PORT,()=>console.log(`Server is running at ${PORT}`));