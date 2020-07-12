{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE DeriveFunctor #-}
{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE TemplateHaskell #-}
{-# LANGUAGE GeneralizedNewtypeDeriving #-}
module Main where
import Prelude hiding (sum)
import Control.Applicative
import qualified Data.ByteString.Lazy as BL
import Data.Csv
import qualified Data.Vector as V
import GHC.Generics hiding (to)
import qualified Data.Text as T
import Lens.Micro
import Lens.Micro.TH
import Control.Monad.Reader
import Data.Function

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
  parseField s = MInt <$> optional (parseField s :: Parser Int)

data Attendance = Here | NoShow deriving (Generic, Show)

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
    , _attendance :: !Attendance
    , _isBeginner :: !YN
    , _technicalComplexity :: !MInt
    , _creativity :: !MInt
    , _impact :: !MInt
    , _presentation :: !MInt
    , _judgeImpression :: !MInt
    , _comments :: !T.Text
    , _sum :: !MInt
    , _finalists ::  !T.Text
    , _notes :: !T.Text
    , _beg :: !MInt
    }
    deriving (Generic, Show)

makeLenses ''ScoreRow

instance FromRecord ScoreRow

instance ToRecord ScoreRow

getData s = do
  f <- BL.readFile s
  let v = decode HasHeader f
  case v of
    Right l -> return l
    Left err -> error err

getDataL s = V.toList <$> getData s

newtype ScoreReader a =
  ScoreReader
    { runScoreReader :: Reader (V.Vector ScoreRow) a
    }
  deriving (Functor, Applicative, Monad, MonadReader (V.Vector ScoreRow))

weightedSum x = add (x ^. impact) (add (scale 2 (add (x ^. presentation)(x ^. creativity))) (x ^. technicalComplexity))
  where
    scale i (MInt x) = MInt (fmap (*i) x)
    add (MInt (Just x)) (MInt (Just y)) = MInt (Just (x + y))
    add (MInt (Just x)) (MInt Nothing) = MInt (Just x)
    add (MInt Nothing) (MInt (Just y)) = MInt (Just y)

main = do
  d <- getDataL "scores.csv" :: IO [ScoreRow]
  let g x = (x^.table.val, (weightedSum x))
  putStrLn "(Table, Sum) (top 10)"
  let l = take 10 (L.sortBy (flip compare `on` _sum) d)
  forM_ (g <$> l)
    (\case
       (Just x,(MInt (Just y))) -> print (x,y)
       a -> print ("Incomplete row: " <> show a)
    )
