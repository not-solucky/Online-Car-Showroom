import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './carPage.css';
import PriceRange from '../components/priceRange.jsx';
import ExtendedList from '../components/extendedList';
import jwt_decode from 'jwt-decode';

function CrossIcon() {
  return (
    <>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
</svg>

    </>
  )
}
function CommentBox({userInfo, carid}){
  const [commented, setCommented] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [update, setUpdate] = useState(false);
  const fetchComment = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/user/commented?userId=${userInfo.user_id}&carId=${carid}`);
      setCommented(response.data.commented);
      setComment(response.data.comment[0].message);
      setRating(response.data.comment[0].rating);
    } catch (error) {
      console.error('Error fetching car data:', error);
      setCommented(false);
    }
  };
  const postComment = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/user/addcomment?update=${update}`,{
        userId: userInfo.user_id,
        carId: carid,
        rating: rating,
        comment: comment
      });
      setCommented(true);
    } catch (error) {
      console.error('Error fetching car data:', error);
    }
  };
  
  useEffect(() => {
    fetchComment();
  }, []);
  return (
    <div className="review-user">
      <div className="review-user-image">
        
      </div>
      <div className="review-comment-container">
          <div className="review-user-name">
            <h3>{userInfo.name}</h3>
          </div>
          
          {commented ? (
            <>
            <div className="review-user-rating">
              
              <p>Rated: {rating}</p>
            </div>
            <div className="review-user-comment">
            <p>{comment}</p>
            </div>
            <div className="review-edit">
              <button className="review-button" onClick={()=>{setCommented(false), setUpdate(true)}}>Edit</button>
            </div>
            </>) : (<>
            <div className="review-user-comment">
            <div className="review-rating">
              <p>Rating: </p>
              <select className="review-select" onChange={(e)=>{setRating(e.target.value)}}>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value='5'>5</option>
              </select>
            </div>
            <textarea className="review-textarea" placeholder="Write your review here" onChange={(e)=>{setComment(e.target.value)}} value={comment}></textarea>
            </div>
            <div className="review-submit">
              <button className="review-button" onClick={()=>{postComment()} }>Submit</button>
            </div>

            </>
          )
            }
          
          <div className="review-border"></div>
      </div>
    </div>
  )
}

function IndividualReview({name, rating, comment}){
  return (
    <div className="review-user">
      <div className="review-user-image">
        
      </div>
      <div className="review-comment-container">
          <div className="review-user-name">
            <h3>{name}</h3>
          </div>
          <div className="review-user-rating">
            <p>Rated: {rating}</p>
          </div>
          <div className="review-user-comment">
            <p>{comment}</p>
          </div>
          <div className="review-border"></div>
      </div>
    </div>
  );
}
function ReviewBox({comments, carid, userInfo,userId}){
  
  return (
    <div className="review-box">
      <div className="title">
        <h3>Reviews</h3>
      </div>
      {userInfo &&
        <CommentBox userInfo={userInfo} carid = {carid}/>}
        
        {comments.length === 0 && <div className="no-reviews-box"><p>No reviews yet</p></div>}
        {comments.map((comment) => (
          comment.user_id !== userId && (
          <IndividualReview key={comment.id} name={comment.user_name} rating={comment.rating} comment={comment.message} />
          )
        ))}
    </div>
  )
}
  
function CarExtended({carId}){
  const [carComment, setCarComment] = useState([]);
  const [carData, setCarData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [userId, setUserId] = useState('');
  
  useEffect(() => {
    fetchCarComment();
    fetchCar();
    fetchUserInfo();
  }, [carId]);
  const fetchUserInfo =() => {
    try{
      const token = localStorage.getItem('token');
      const decodedToken = jwt_decode(token);
      setUserInfo(decodedToken);
      setUserId(decodedToken.user_id);
      
    }catch (error){
      console.log(error);
    }
  }
  
  const fetchCar = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/user/getcar?carId=${carId}`);
      setCarData(response.data.carData);
      setIsLoading(false);

    } catch (error) {
      console.error('Error fetching car data:', error);
      setIsLoading(false);
    }
  };
  const fetchCarComment = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/user/comments?carId=${carId}`); 
      setCarComment(response.data.comment);
    }
    catch (error) {
      console.error('Error fetching comments', error);
    }
  }
  return (
    <>
    {isLoading ? (
      <div className="loading">Loading...</div>
    ) : (
    <div className="car-extended-container">
      <div className="car-extended-row">
        <div className="car-extended-image">
          <img src={`http://localhost:5000/images/image/${carData.images}`} alt="image" /> 
        </div>
        <div className="car-extended-info">
          <div className="car-extended-title">
          <h3>{carData.brand}</h3>
          <h4>{carData.model}</h4>
          </div>
          <div className="car-extended-year">
            <p>{carData.year}</p>
          </div>
          <div className="car-extended-description">
            <p>{carData.description}</p>
          </div>
          <div className="car-extended-specs">
            <p className = "title">Specs</p>
            <div className="car-extended-spec-grid">
              <div className="car-extended-spec-item">
                <p className='title'>Engine</p>
                <p>{carData.engine}</p>
              </div>
              <div className="car-extended-spec-item">
                <p className='title'>Transmission</p>
                <p>{carData.transmission}</p>
              </div>
              <div className="car-extended-spec-item">
                <p className='title'>Fuel</p>
                <p>{carData.fuel}</p>
              </div>
              <div className="car-extended-spec-item">
                <p className='title'>Price</p>
                <p>{carData.price}</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      <ReviewBox comments = {carComment} carid = {carId} userInfo={userInfo} userId={userId}/>
    </div>
  )
  }
  </>
  );
}

export default function CarPage() {
  const sortData = ["Price: Low to High", "Price: High to Low", "Stock", "Modified"];

  const pageSize = 12;
  const [carData, setCarData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [carTotal,setCarTotal] = useState(0);
  const [selectedCarId, setSelectedCarId] = useState(null);

  const handleForward = () => {
    if (page < Math.ceil(carTotal/pageSize)){
      setPage(prevPage => prevPage + 1);
    }
  };
  const handleBackward = () => {
    if (page > 1){
      setPage(prevPage => prevPage - 1);
    }
  };
  
  useEffect(() => {
    fetchCarData();
  }, [page]);

  const fetchCarData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/user/car?page=${page}&pageSize=${pageSize}`);
      setCarData(response.data.data);
      setCarTotal(response.data.count); // Assuming the data is directly in response.data.data
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching car data:', error);
      setIsLoading(false);
    }
  };

 
  return (
    <>
    <div className="relative flex carpage-container">
        {selectedCarId && 
          <div className="selected-car-container">
            <div className="close">
              <button onClick={()=>{setSelectedCarId(null)}}><CrossIcon/></button>
            </div>
            <CarExtended carId={selectedCarId}/>
            
          </div>
        }
      <div className="toolbar-container">
          <PriceRange/>
          <ExtendedList data = {sortData} title = "Sort" />
          <ExtendedList data = {sortData} title = "Brand" />
          <ExtendedList data = {sortData} title = "Type" />
      </div>
      <div className=" display-container">
      
        <div className=" display-item-container">
        
        {isLoading ? (
              <div className="loading">Loading...</div>
            ) : (
              carData.map((car, index) => (
                <div className="bg-white border border-gray-200 rounded-lg shadow cursor-pointer max-w-g dark:bg-gray-800 dark:border-gray-700 hover:shadow-md" onClick={()=>{setSelectedCarId( car.car_id)}}>
                    <div className=" h-60">
                      <img className ="car-card-img" src={`http://localhost:5000/images/image/${car.images}`} alt="image" />
                    </div>
                    <div className="p-5">
                        <h5 className = "mb-2 text-xl font-bold text-gray-700 dark:text-gray-200">{car.brand+" "+car.model}</h5>
                        <p className="mb-3 text-sm text-gray-900 dark:text-gray-100">{car.year}</p>
                        <div className="flex items-center mt-4 text-gray-700 dark:text-gray-200">
                            
                            <p className="text-sm ">Price: {car.price}</p>
                            </div>
                    </div>
                </div>
              ))
            )}
        </div>
        <div className="display-page-count">
          {
            <>
            <div className="item-left">
              <p>Page {page} of {Math.ceil(carTotal/pageSize)}</p>
            </div>
            <div className="item-middle">
              <button className="page-button" onClick={handleBackward}>{"<"}</button>
              <button className="page-button" onClick={handleForward}>{">"}</button>
            </div>
            
            </>
          }
        </div>
        
      </div>
      
    </div>
    </>
  );
}
