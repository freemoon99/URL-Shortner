import React, {useEffect, useState} from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [urlLink, setUrlLink] = useState('');
  const [list, setList] = useState([]);
  const [click, setClick] = useState('');
  const [shortenUrl, setShortenUrl] = useState([]);
  const [getErr, SerGetErr] = useState();
  const [prevUrl, setPrevUrl] = useState();
  
  useEffect(()=>{
    axios.get(`/getUrls`)
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

    axios.post(`/inputUrl`, urlLink)
    .then((res) => {
      setShortenUrl(res.data.shortUrl);
    })
    .catch((err)=>{
      alert(err.response.data.message);
      SerGetErr(err.response.data.status);
      setPrevUrl(err.response.data.prevUrl);
    })
  } 

  const isErr = (ele) => {
    if(ele === '400') return true;
  }

  return (
    <div className='allsec'>
      <div className='container'>
        <h2>Create Short URL</h2>
        <form>
          <div className='form-group'>
            <input type='url' placeholder="Input URL Link" className='form-control' onChange={onChangeLink}/>
          </div>
          <div className='form-group'>
            <button className='form-control' onClick={onClickbtn}>단축하기</button>
          </div>
        </form>
        <div className='urltext'>생성된 주소: <a href={`${shortenUrl}`}>{isErr(getErr)?prevUrl:shortenUrl}</a></div>
        <h2>Shorten List</h2>
        <table className='table'>
          <thead>
            <tr>
              <th className='th'>fullUrl</th>
              <th className='th'>shortUrl</th>
            </tr>
          </thead>
          <tbody>
            {list.map((ele, idx)=>(
              <tr key={idx}>
                <td className='th' name='fullname'><a href={ele.fullUrl}>{ele.fullUrl}</a></td>
                <td className='th'><a href={process.env.PROXY+'/'+ele.shortUrl}>{process.env.PROXY+'/'+ele.shortUrl}</a><button className='xbtn' onClick={()=>{axios.post('/deleteUrl', ele.fullUrl).then((res)=>{alert('성공')}).catch((err)=>{alert('실패')})}}>❌</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='footer'>Copyright freemoon99 All rights reserved.<br/>contact @freemoon99</div>
    </div>
  );
}

export default App;
