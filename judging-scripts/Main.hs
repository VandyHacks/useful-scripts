{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE DeriveFunctor #-}
{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE TemplateHaskell #-}
{-# LANGUAGE GeneralizedNewtypeDeriving #-}

module Main where

import           Control.Applicative
import           Control.Monad
import           Data.Csv
import           Data.IORef
import           Data.Maybe
import           GHC.Generics
import           Lens.Micro
import           Lens.Micro.TH
import qualified Data.ByteString.Lazy as BL
import qualified Data.Map as M
import qualified Data.Text as T
import qualified Data.Vector as V
import qualified Data.List as L

data YN = Yes | No deriving (Generic, Show)

instance FromField YN where
  parseField "Yes" = pure Yes
  parseField "No" = pure No
  parseField _ = mzero

instance ToField YN where
  toField Yes = "Yes"
  toField No = "No"

newtype MInt = MInt { _val :: Maybe Int } deriving (Show, Ord, Eq)
makeLenses ''MInt

instance ToField MInt where
  toField (MInt Nothing) = ""
  toField (MInt (Just i)) = toField (show i)

instance FromField MInt where
  parseField s = MInt <$> optional (parseField s)

data Attendance = Here | NoShow deriving (Show, Generic)

instance ToField Attendance where
  toField Here = "Here"
  toField NoShow = "No show"

instance FromField Attendance where
  parseField "Here" = pure Here
  parseField "No show" = pure NoShow

data ScoreRow = ScoreRow
    { _timestamp   :: !T.Text
    , _name :: !T.Text
    , _table :: !MInt
    , _technicalAbility :: !MInt
    , _creativity :: !MInt
    , _utility :: !MInt
    , _presentation :: !MInt
    , _impression :: !MInt
    , _additionalComments :: !T.Text
    }
    deriving (Generic, Show)

makeLenses ''ScoreRow

instance FromRecord ScoreRow

instance ToRecord ScoreRow

weightedSum :: ScoreRow -> MInt
weightedSum x = foldr (\s res -> add (x ^. s) . res) (add (MInt (Just 0))) selectors (MInt (Just 0))
  where
    selectors = [technicalAbility, utility, creativity, presentation, impression]
    add (MInt (Just x)) (MInt (Just y)) = MInt (Just (x + y))
    add _ _ = MInt Nothing

getData s = do
  f <- BL.readFile s
  case decode HasHeader f of
    Right l -> pure l
    Left err -> error err

ins tNum score = M.adjust f tNum (0,0)
  where
    f (count, acc) = (count + 1, acc + score)

main = do
  dat <- V.toList <$> getData "responses1.csv"
  let g x = (x^.table.val, weightedSum x)
  putStrLn "Table\tAverage Score"
  table <- newIORef mempty
  forM_ (g <$> dat)
    (\case
       (Just x, MInt (Just y)) -> do
         t <- readIORef table
         when (isNothing (M.lookup x t))
           (modifyIORef table (M.insert x (0,0)))
         modifyIORef table (ins x y)
       _ -> pure ())
  res <- readIORef table
  let h (t, (c,s)) = (t,fromIntegral s / fromIntegral c)
  let f (a, b) = putStrLn (show a <> "\t" <> show b)
  mapM_ f (L.take 20 (L.reverse (L.sortOn snd (h <$> M.toList res))))
