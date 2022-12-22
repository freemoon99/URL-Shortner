const express = require('express');
const mysql = require('mysql');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
require('dotenv').config();
const port = 5000;

app.use(express.static(path.join(__dirname, '/shortner/build')));
app.use(express.json());
var cors = require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//데이터 베이스 연결
const db = mysql.createConnection({
  host:process.env.HOST,
  user:process.env.USER,
  password:process.env.PASSWORD,
  database:process.env.DATABASE,
});

db.connect((err) => {
  if(err){
    console.log('db 연결 에러');
  }
  console.log('db 연결 성공');
})

// const base62 = (num) => {
//   let quotient = num;
//   let reminder = [];
//   let codes = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  
//   while(quotient >= 62){
//     reminder.push(quotient%62);
//     quotient = Math.floor(quotient/62);
//   }

//   quotient = codes[quotient];

//   while (reminder.length > 0){
//     quotient = quotient + codes[reminder.pop()];
//   }
//   return quotient;
// }

//링크 가져오기
const getLinks = (req,res) =>{
  let sql = `SELECT * FROM url`;
  db.query(sql, (err, result) => {
    if(err){
      console.log(err);
    } else {
      console.log(result)
      res.sendFile(path.join(__dirname, '/shortner/build/index.html'));
    }
  })
}
//get method : 메인페이지 랜더링시
app.get('/', (req, res) => {
  getLinks(req, res);
});

//post method
app.post('/inputUrl', (req, res) => {
  let shorten = Math.random().toString(36).replace(/[^a-z0-9]/gi,'').substring(2,10);
  let sql = `INSERT INTO url(fullUrl,shortUrl) VALUES('${Object.values(req.body)}','http://kyu.sh/${shorten}')`
  db.query(sql, (err, result)=>{
    if(err){
      res.status(500).json({
        status:'notok',
        message:'ERROR1'
      });
    } else {
      res.status(200).json({
        status:'ok',
        shortUrl:`http://kyu.sh/${shorten}`,
      });
    }
  })
})

//get method : 변환된 주소 받아오기
app.get('/getUrls',(req,res)=>{
  let sql = `SELECT * FROM url`;
  db.query(sql, (err, result)=>{
    if(err){
      res.status(500).json({
        status:'notok',
        message:'ERROR2'
      });
    } else {
      res.status(200).json(result);
    }
  })
})

app.listen(port, ()=> {
  console.log(`서버가 실행됩니다. http://localhost:${port}`);
});