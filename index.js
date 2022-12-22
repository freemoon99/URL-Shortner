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
  const basic = `http://localhost:3000`;
  const fullUrl = req.body.fullUrl;
  let shorten = Math.random().toString(36).replace(/[^a-z0-9]/gi,'').substring(2,10);
  let findSql = `SELECT * FROM url WHERE fullUrl = ?`
  let sql = `INSERT INTO url(fullUrl, shortUrl) VALUES('${fullUrl}','${shorten}')`
  if(!fullUrl){
    res.status(400).json({
      status:'400',
      message:'ERROR: 데이터가 입력되지 않았습니다.'
    });
  }
  
  db.query(findSql,[fullUrl],(err,results)=>{
    if(err){
      console.log(err);
      res.sendStatus(404);
    }
    if(results.length === 0){
      db.query(sql,(err,res)=>{
        if(err){
          res.status(400).json({
            status:'400',
            message:'ERROR: 데이터 입력에 오류가 있습니다.'
          });
        }
      })
    } else {
      res.status(400).json({
        status:'400',
        message:'ERROR: 이미 중복된 값이 들어있습니다.'
      });
    }
  })
})

// // get method : 주소 리다이렉트
// app.get('/:shortUrl',(req,res)=>{
//   let shortID = req.params.ID;
//   let sql = `SELECT * FROM url WHERE `;
//   db.query(sql, (err, result)=>{
//     if(err){
//       res.status(500).json({
//         status:'notok',
//         message:'ERROR2'
//       });
//     } else {
//       res.status(200).json(result);
//     }
//   })
// })

app.listen(port, ()=> {
  console.log(`서버가 실행됩니다. http://localhost:${port}`);
});