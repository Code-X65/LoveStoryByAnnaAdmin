import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar'
import Dashboard from './Pages/Dashboard'
import ProductListing from './Pages/ProductListing'
import Customers from './Pages/Customers'
import Analytics from './Pages/Analytics'
import Promotions from './Pages/Promotions'
import Shipping  from './Pages/Shipping'
import Reviews from './Pages/Reviews'
import OrderPage from './Pages/OrderPage'
import AddProduct from './Pages/AddProduct'



const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Router basename='/LoveStoryByAnnaAdmin/'>
      <div className='flex'>
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        {/* Dynamic margin based on collapsed state */}
        <div className={`${collapsed ? 'ml-20' : 'ml-64'} flex-1 min-h-screen  bg-gray-100 transition-all duration-300`}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path='/orders' element={<OrderPage />} />
            <Route path='/customers' element={<Customers/>} />
            <Route path='/Analytics' element={<Analytics />} />
            <Route path='/Promotions' element={<Promotions />} />
            <Route path='/Shipping' element={<Shipping />} />
            <Route path='/Reviews' element={<Reviews />} />
            <Route path='/products' element={<ProductListing />} />
            <Route path='/add-product' element={<AddProduct />} />



          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App