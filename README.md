# URL Shortner

## 역할
|서비스|역할|
|---|---|
|URL 단축기|- 무분별하게 길어지는 URL 단축|


## 기술스택
- node.js v14.20.1
- express.js
- React ^18.2.0
- MySQL

## 코드 중 확인 받고 싶은 부분
- 백엔드에 대한 코드(프론트에서 백엔드로 전향을 지망하여 이번에 백엔드에 더 집중해서 작성한 코드들을 맞게 한 것인지 모르겠습니다)
- 도메인 로직 분리에 대한 TIP 과 예시 

## 개발 관련 과정에서 궁금했던 부분
- 도메인 로직 분리에 대해서 확실하게 이해하고 싶습니다.
- 백엔드 개발자로서 개발할때 집중해야 되는 부분과 제가 코드를 짜면서 놓쳤다고 생각되는 부분에 대해서 듣고 싶습니다.
- 추가로 참고하면 좋은 자료나 공부할 것
- 아키텍처는 어떻게 작성해야되는지

## 아키텍처

![아키텍처](https://user-images.githubusercontent.com/102667851/209420954-0fc9a4d9-2741-485b-a4e3-6f932446b36d.png)

## 제공 기능
|기능|설명|
|---|---|
|URL 단축 | URL 단축 기능|
|URL 단축 결과 출력 | 출력된 링크를 통해 URL 연결|
|단축 기록 출력 | 지금까지 단축했던 기록 출력|

## 구현

![화면 캡처](https://user-images.githubusercontent.com/102667851/209246809-baed3b7e-323e-4a4f-8dbe-9622066d7c44.png)

### REST API
```javascript
// get method : 메인 페이지 로딩시 html파일 로딩
app.get('/', (req, res) => {
  let sql = `SELECT * FROM url`;
  db.query(sql, (err, result) => {
    if(err){
      console.log(err);
    } else {
      console.log(result)
      res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    }
  })
});
// get method : url을 받아옴
app.get('/getUrls',(req,res)=>{
  let sql = `SELECT * FROM url`;
  db.query(sql, (err, result)=>{
    if(err){
      res.status(404).json({
        status:'404',
        message:'ERROR: 서버에 문제가 있습니다.'
      });
    } else {
      res.status(200).json(result);
    }
  })
})

//post method
app.post('/inputUrl', (req, res) => {
  const fullUrl = req.body.fullUrl;
  let shorten = Math.random().toString(36).replace(/[^a-z0-9]/gi,'').substring(2, 9);
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
        message:'ERROR: 이미 중복된 값이 들어있습니다.',
        prevUrl:`${process.env.PROXY}/${results[0].shortUrl}`,
      });
    }
  })
})

// get method : 주소 리다이렉트
app.get('/:shortUrl',(req,res)=>{

  let findSql = `SELECT * FROM url WHERE shortUrl = ?`
  db.query(findSql,[req.params.shortUrl],(err, result)=>{
    if(err){
      res.status(404).json({
        status:'404',
        message:'ERROR: 서버에 문제가 있습니다.'
      });
    } else {
      res.redirect(result[0].fullUrl)
    }
  })
})

// post method : 삭제
app.post('/deleteUrl',(req,res)=>{
  let name = Object.keys(req.body);
  let delSql = `DELETE FROM url WHERE fullUrl = ?`
  db.query(delSql,[name],(err, result)=>{
    if(err){
      res.status(404).json({
        status:'404',
        message:'ERROR: 잘못된 접근입니다'
      });
    } else {
      res.sendStatus(200);
    }
  })
})
```

## 프로젝트 진행 중 이슈
### 1. 통신오류 
- 쿼리문 오류로 인한 오류
- 데이터 형식을 놓쳐서 발생한 오류 (JSON 형식으로 받아오는 것을 복기)
```javascript
// 객체의 값에 접근
Object.values(이름);
```
### 2. 디비에서 데이터가 있는지 찾아보는 법 
- 쿼리문 오류
```javascript
let findSql = `SELECT * FROM url WHERE shortUrl = ?`
```
### 3. 리액트 + 서버 + 디비의 연결 

### 4. 환경변수 및 proxy설정법 (프론트, 백 다르게 함)
- 프론트는 package.json 에 proxy:~~~ (axios에 proxy는 생략 가능)
- 백엔드는 .env 파일로 설정

 ## 참고
 - MySQL 쿼리문 개념 http://www.tcpschool.com/mysql/intro
 - 리액트 + 서버 + 디비 연결 https://codingapple.com/unit/nodejs-react-integration/
 - REST API 만들기 https://jy-tblog.tistory.com/47
