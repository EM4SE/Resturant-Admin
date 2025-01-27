import { element } from 'prop-types'
import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))


const Categories = React.lazy(() => import('./views/categories/Categories'))
const Products = React.lazy(() =>import('./views/products/Products'))
const Tables = React.lazy(() => import('./views/tables/Tables'))
const Orders = React.lazy(() => import('./views/orders/Orders'))
const Cashiers = React.lazy(() => import('./views/Staff/Cashiers/Cashiers'));


const routes = [
  {path:'products',name:'Products',element:Products},
  { path: '/categories', name: 'Categories', element: Categories},
  {path:'/tables', name: 'Tables', element: Tables},
  {path:'/orders',name:'Orders',element:Orders},
  { path: '/staff/cashiers', name: 'Cashiers', element: Cashiers },
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
]

export default routes
