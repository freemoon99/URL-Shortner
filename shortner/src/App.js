import React, {useEffect, useState} from 'react';
import './App.css';
import axios from 'axios';


function App() {
  const [urlLink, setUrlLink] = useState('');
  const [list, setList] = useState([]);
  const [click, setClick] = useState('');
  const [shortenUrl, setShortenUrl] = useState([]);
  useEffect(()=>{
    axios.get('http://localhost:5000/getUrls')
    .then((res)=>{
      if(res.data){
        setList(res.data);
      }else alert('목록을 가져오는데 실패했습니다.');
    })
  },[click])

  const onChangeLink=(e)=>{
    setUrlLink({
      ...urlLink,
      fullUrl:e.target.value
    })
  };

  const onClickbtn = async () =>{
    if(click === 0) setClick(1);
    else setClick(0);
    if(Object.values(urlLink).join('').includes(' ')){
      alert('URL을 입력해주세요.');
      return;
    } else if(!Object.values(urlLink).join('').includes('http://')){
      alert('URL이 잘못되었습니다.')
      return;
    }
    axios.post('http://localhost:5000/inputUrl', urlLink)
    .then((res) => {
      setShortenUrl(res.data.shortUrl)
    })
    .catch((err)=>{console.log(err)})
    
  }
  

  return (
    <div className='allSec'>
      <h1>Create Short URL</h1>
      <label>Input Link</label>
      <input type='text' id='inputUrl' placeholder='input url link' onChange={onChangeLink}/>
      <button onClick={onClickbtn}>단축하기</button>
      <div>생성된 주소: <a href={`${shortenUrl}`}>{shortenUrl}</a></div>
      <h2>Shorten List</h2>
      <table>
        <thead>
          <tr>
            <th>fullUrl</th>
            <th>shortUrl</th>
          </tr>
        </thead>
        <tbody>
          {list.map((ele, idx)=>(
            <tr key={idx}>
              <td><a href={ele.fullUrl}>{ele.fullUrl}</a></td>
              <td><a href={ele.shortUrl}>{ele.shortUrl}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
