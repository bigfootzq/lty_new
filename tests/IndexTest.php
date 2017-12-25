<?php
namespace tests;

class IndexTest extends TestCase
{

   public function testTest()
   {
       $this->visit('/index/index/test')->see('Hello world!');
	   
   }
}