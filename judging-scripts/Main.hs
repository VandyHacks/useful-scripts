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
import qualified Data.Map as M
import Data.IORef
import Data.Maybe

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

weightedSum x = add (x ^. technicalAbility)
                    (add (add (x ^. utility) (x ^. creativity))
                         (add (x ^. presentation) (x ^. impression)))
  where
    scale i (MInt x) = MInt (fmap (*i) x)
    add (MInt (Just x)) (MInt (Just y)) = MInt (Just (x + y))
    add (MInt (Just x)) (MInt Nothing) = MInt (Just x)
    add (MInt Nothing) (MInt (Just y)) = MInt (Just y)
    add _ _ = MInt Nothing


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

ins tNum score = M.insertWith f tNum (0,0)
  where
    f _ (count, acc) = (count + 1, acc + score)

main = do
  d <- getDataL "responses.csv" :: IO [ScoreRow]
  let g x = (x^.table.val, (weightedSum x))
  putStrLn "(Table, Sum) (top 10)"
  let l = d
  table <- newIORef mempty :: IO (IORef (M.Map Int (Int, Int)))
  forM_ (g <$> l)
    (\case
       (Just x, MInt (Just y)) -> do
         t <- readIORef table
         when (isNothing (M.lookup x t))
            (modifyIORef table (M.insert x (0,0)))
         modifyIORef table (ins x y)
       a -> pure ()
    )
  res <- readIORef table
  let h (t,(c,s)) = (t,fromIntegral s / fromIntegral c)
  mapM_ print (L.take 10 (L.reverse (L.sortOn snd (h <$> M.toList res))))
